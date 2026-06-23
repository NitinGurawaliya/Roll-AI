import { completeJSON } from "@/lib/openai";
import {
  PERSONA_LABELS,
  type CareerPath,
  type DiscoveryAnswers,
  type PathDetail,
  type Persona,
} from "@/lib/types";

const GENERATE_SYSTEM = `You are a sharp, direct career coach. Using a person's resume, persona, the career tension you identified, and their stated preferences, you recommend personalized career paths.

Rules:
- Recommend EXACTLY 3 career paths.
- Each path must be genuinely supported by the resume — reference real skills, projects, or experience.
- Honor their preferences: lean toward work they find energizing, away from what drains them, and weight what matters most to them.
- NEVER recommend any role in the "excluded roles" list, and avoid near-duplicates of those titles.
- Match scores must be honest and differentiated (realistic range ~70-97), not all the same.

Return ONLY valid JSON in this exact shape:
{
  "paths": [
    {
      "title": "Role / direction title",
      "score": 94,
      "reason": "2-3 sentences on why this fits THEM specifically, citing resume evidence and their preferences.",
      "growth": "1-2 sentences on the growth potential / trajectory of this path.",
      "strengths": ["concrete strength from their resume", "another", "another"]
    }
    // exactly 3 items
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
    user
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

const DETAIL_SYSTEM = `You are a sharp, direct career coach building a focused action plan for someone who has chosen a specific career path.

Using their resume, persona, and the chosen path, produce:
- whyItFits: 2-3 sentences on why this path is a strong fit for THEM specifically (cite resume evidence).
- existingStrengths: 3-5 concrete strengths they already have for this path, drawn from their resume.
- skillGaps: 3-5 honest, specific gaps they need to close for this path.
- nextSteps: 3-5 concrete actions to start now.
- roadmap: a realistic 90-day plan split into three stages, each a list of 2-4 concrete actions.

Be specific and actionable. No filler. Return ONLY valid JSON in this exact shape:
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
  }>(DETAIL_SYSTEM, user);

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
