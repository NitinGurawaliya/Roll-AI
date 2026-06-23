import { completeJSON } from "@/lib/openai";
import {
  PERSONA_LABELS,
  type CareerPath,
  type DiscoveryAnswers,
  type PathDetail,
  type Persona,
} from "@/lib/types";

const GENERATE_SYSTEM = `You are a sharp, pragmatic career coach. Using a person's resume, persona, the career tension identified for them, and their stated preferences, you recommend genuinely personalized career paths — the kind that make them think "that actually fits me."

Rules:
- Recommend EXACTLY 3 career paths, and make them MEANINGFULLY DIFFERENT from each other (not three flavors of the same role).
- Each path must be defensible from the resume. In "reason", cite at least one CONCRETE artifact from their resume (a named technology, project, employer, or achievement) AND connect to at least one of their stated preferences.
- "strengths" must be specific, resume-derived capabilities (e.g. "Built a React + Node booking app used by a real client"), NOT generic traits.
- Honor preferences: lean toward energizing work, away from draining work, and weight what they said matters most.
- NEVER recommend any role in the excluded list, or a near-synonym/retitle of one. Each new round must explore genuinely different directions.
- Match scores must be honest and DIFFERENTIATED (spread across roughly 70-97, never identical). The score should reflect real fit, so the strongest path scores clearly higher than the weakest.

BANNED — never use these empty phrases: "strong communication skills", "team player", "fast learner", "passionate", "detail-oriented", "proven track record", "results-driven", "leverage synergies", "dynamic professional". Be concrete.

Return ONLY valid JSON in this exact shape:
{
  "paths": [
    {
      "title": "Specific role / direction title",
      "score": 94,
      "reason": "2-3 sentences citing a real resume artifact + a stated preference, on why THIS fits THEM.",
      "growth": "1-2 sentences on the realistic trajectory and ceiling of this path.",
      "strengths": ["concrete resume-derived strength", "another", "another"]
    }
    // exactly 3 items, meaningfully distinct
  ]
}`;

interface GenerateInput {
  resumeText: string;
  persona: Persona;
  summary: string;
  tension: string;
  answers: DiscoveryAnswers;
  excludedRoles: string[];
}

export async function generateCareerPaths(
  input: GenerateInput
): Promise<CareerPath[]> {
  const { resumeText, persona, summary, tension, answers, excludedRoles } =
    input;

  const user = `RESUME:
${resumeText.slice(0, 12000)}

PERSONA: ${PERSONA_LABELS[persona] ?? persona}

PROFESSIONAL SUMMARY: ${summary}

CAREER TENSION: ${tension}

PREFERENCES:
- Energized by: ${answers.likes || "unspecified"}
- Finds draining: ${answers.dislikes || "unspecified"}
- Values most: ${answers.priority || "unspecified"}

EXCLUDED ROLES (never recommend these or close variants):
${excludedRoles.length ? excludedRoles.map((r) => `- ${r}`).join("\n") : "- (none)"}

Generate exactly 3 fresh career paths.`;

  const result = await completeJSON<{ paths?: Partial<CareerPath>[] }>(
    GENERATE_SYSTEM,
    user,
    { temperature: 0.85 }
  );

  const paths = (result.paths ?? []).slice(0, 3).map((p) => ({
    title: (p.title ?? "Untitled path").trim(),
    score:
      typeof p.score === "number" && p.score >= 0 && p.score <= 100
        ? Math.round(p.score)
        : 80,
    reason: p.reason?.trim() || "",
    growth: p.growth?.trim() || "",
    strengths: Array.isArray(p.strengths)
      ? p.strengths.map((s) => String(s)).filter(Boolean)
      : [],
  }));

  return paths;
}

const DETAIL_SYSTEM = `You are a sharp, pragmatic career coach building a focused action plan for someone who just chose a specific career path. This is the payoff — it must feel tailored to THEM, not a template anyone could receive.

Using their resume, persona, and the chosen path, produce:
- whyItFits: 2-3 sentences citing specific resume evidence (named tech, projects, employers, achievements) for why this path suits them.
- existingStrengths: 3-5 concrete, resume-derived strengths relevant to this path (reference real artifacts, not generic traits).
- skillGaps: 3-5 honest, specific gaps for THIS path — name the actual skills/tools/credentials they're missing, not vague areas.
- nextSteps: 3-5 concrete actions to start this week (specific enough to act on today, e.g. name a project to build or a thing to ship).
- roadmap: a realistic 90-day plan in three stages, each 2-4 concrete, sequenced actions that build on the previous stage.

GROUNDING RULES:
- Tie strengths and gaps to what is (or isn't) actually in their resume.
- Actions must be concrete and verifiable, not "learn more about X" — say what to build, read, ship, or apply to.
- BANNED empty phrases: "strong communication skills", "team player", "fast learner", "passionate", "detail-oriented", "proven track record", "results-driven", "leverage synergies". No filler.

Return ONLY valid JSON in this exact shape:
{
  "whyItFits": "...",
  "existingStrengths": ["...", "..."],
  "skillGaps": ["...", "..."],
  "nextSteps": ["...", "..."],
  "roadmap": {
    "first30": ["...", "..."],
    "days30to60": ["...", "..."],
    "days60to90": ["...", "..."]
  }
}`;

interface PathDetailInput {
  resumeText: string;
  persona: Persona;
  summary: string;
  pathTitle: string;
}

function toStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];
}

export async function generatePathDetail(
  input: PathDetailInput
): Promise<PathDetail> {
  const { resumeText, persona, summary, pathTitle } = input;

  const user = `RESUME:
${resumeText.slice(0, 12000)}

PERSONA: ${PERSONA_LABELS[persona] ?? persona}

PROFESSIONAL SUMMARY: ${summary}

CHOSEN CAREER PATH: ${pathTitle}

Build the focused plan for this path.`;

  const result = await completeJSON<{
    whyItFits?: string;
    existingStrengths?: unknown;
    skillGaps?: unknown;
    nextSteps?: unknown;
    roadmap?: {
      first30?: unknown;
      days30to60?: unknown;
      days60to90?: unknown;
    };
  }>(DETAIL_SYSTEM, user, { temperature: 0.55 });

  return {
    whyItFits: result.whyItFits?.trim() || "",
    existingStrengths: toStringList(result.existingStrengths),
    skillGaps: toStringList(result.skillGaps),
    nextSteps: toStringList(result.nextSteps),
    roadmap: {
      first30: toStringList(result.roadmap?.first30),
      days30to60: toStringList(result.roadmap?.days30to60),
      days60to90: toStringList(result.roadmap?.days60to90),
    },
  };
}
