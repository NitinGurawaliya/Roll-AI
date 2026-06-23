import { completeJSON } from "@/lib/openai";
import {
  PERSONA_LABELS,
  type CareerPath,
  type DiscoveryAnswers,
  type DiscoveryQuestion,
  type PathDetail,
  type Persona,
} from "@/lib/types";

const GENERATE_SYSTEM = `You are a sharp, pragmatic career coach. Using a person's resume, persona, the career tension identified for them, and their stated preferences, you recommend genuinely personalized career paths.

For EACH recommended role, you do a concrete skills-gap analysis against THEIR resume:
- matchedSkills: specific, concrete skills/tools/technologies that ARE in their resume and DIRECTLY matter for this role. Each item must be SHORT — a skill or tool name (1-4 words), e.g. "React", "Node.js", "SQL", "A/B testing", "Stakeholder management". NOT sentences.
- missingSkills: specific skills/tools/credentials this role needs that are NOT evident in their resume — what they'd realistically need to learn. Same short format (1-4 words each), e.g. "Kubernetes", "System design", "Go", "Product analytics".

CRITICAL — TITLES MUST BE REAL JOB TITLES:
- Every "title" MUST be a standard, real-world job title that companies actually post and recruiters actually search for on LinkedIn / Indeed. If you cannot picture this exact title in a real job posting, DO NOT use it.
- Use conventional industry titles, e.g.: "Frontend Engineer", "Full Stack Developer", "Backend Engineer", "DevOps Engineer", "Software Engineer", "Senior Software Engineer", "Data Engineer", "Data Scientist", "Machine Learning Engineer", "Product Manager", "Technical Product Manager", "Engineering Manager", "Solutions Engineer", "Site Reliability Engineer", "Cloud Engineer", "Mobile Engineer", "Security Engineer", "QA Engineer", "Developer Advocate".
- Seniority prefixes (Junior / Senior / Staff / Lead) are fine when justified by experience.
- DO NOT invent niche, clever, hybrid, or company/industry-specific titles. BANNED examples of what NOT to do: "Micro-Frontend Architect", "Restaurant Tech Solutions Engineer", "SaaS Platform Developer", "AI Applications Wizard", "Growth Hacking Ninja". These are not real titles.
- If a domain is relevant (e.g. fintech, healthcare), keep the title standard and just reflect the domain in the skills, NOT in an invented title.

Other rules:
- Recommend EXACTLY 3 career paths, MEANINGFULLY DIFFERENT from each other (not three flavors of the same role).
- matchedSkills must be REAL items found in the resume — never invent a skill they don't have. Provide 3-6 items.
- missingSkills must be genuinely relevant to the role and genuinely absent from the resume. Provide 2-5 items.
- Use real, recognizable skill/tool names — not vague phrases. NO full sentences, NO generic traits like "communication" or "teamwork".
- Honor preferences: lean toward energizing work, away from draining work, weight what they said matters most.
- NEVER recommend any role in the excluded list, or a near-synonym/retitle. Each new round must explore genuinely different directions (but still standard titles).
- Match scores honest and DIFFERENTIATED (roughly 70-97, never identical); higher score = more matched / fewer missing skills.

Return ONLY valid JSON in this exact shape:
{
  "paths": [
    {
      "title": "Full Stack Developer",
      "score": 94,
      "matchedSkills": ["React", "Node.js", "PostgreSQL"],
      "missingSkills": ["System design", "AWS"]
    }
    // exactly 3 items, meaningfully distinct, all REAL job titles
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

function toSkillList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, max);
}

export async function generateCareerPaths(
  input: GenerateInput
): Promise<CareerPath[]> {
  const { resumeText, persona, summary, tension, answers, excludedRoles } =
    input;

  const prefs = answers.length
    ? answers.map((a) => `- ${a.question} → ${a.answer}`).join("\n")
    : "- (none provided)";

  const user = `RESUME:
${resumeText.slice(0, 12000)}

PERSONA: ${PERSONA_LABELS[persona] ?? persona}

PROFESSIONAL SUMMARY: ${summary}

CAREER TENSION: ${tension}

USER PREFERENCES (their answers to resume-specific questions):
${prefs}

EXCLUDED ROLES (never recommend these or close variants):
${excludedRoles.length ? excludedRoles.map((r) => `- ${r}`).join("\n") : "- (none)"}

Generate exactly 3 fresh career paths with matched/missing skills for each.`;

  const result = await completeJSON<{
    paths?: Array<{
      title?: string;
      score?: number;
      matchedSkills?: unknown;
      missingSkills?: unknown;
    }>;
  }>(GENERATE_SYSTEM, user, { temperature: 0.85 });

  const paths = (result.paths ?? []).slice(0, 3).map((p) => ({
    title: (p.title ?? "Untitled path").trim(),
    score:
      typeof p.score === "number" && p.score >= 0 && p.score <= 100
        ? Math.round(p.score)
        : 80,
    matchedSkills: toSkillList(p.matchedSkills, 6),
    missingSkills: toSkillList(p.missingSkills, 5),
  }));

  return paths;
}

const QUESTIONS_SYSTEM = `You are a perceptive career coach. Based ONLY on a specific person's resume, you write 3 sharp multiple-choice questions that uncover their genuine interests and how they want to direct their career.

Each question MUST be grounded in THEIR resume — reference real things they've actually done (specific technologies, projects, domains, roles, responsibilities). The questions should feel like they were written by someone who read THIS resume, not a generic survey.

Across the 3 questions, probe different dimensions, e.g.:
- Which part of their actual experience they want to do MORE of vs. leave behind.
- Which direction/domain excites them given what they've worked on.
- What they want their next role to optimize for, framed against their background.

Rules:
- EXACTLY 3 questions, EXACTLY 3 options each.
- Options must be concrete and mutually distinct — reference real skills/domains/work from the resume where possible. NO generic filler like "Other" or "Not sure".
- Keep each question to one clear sentence. Keep each option short (a few words to one short phrase).

Return ONLY valid JSON in this exact shape:
{
  "questions": [
    { "prompt": "question grounded in their resume?", "options": ["concrete A", "concrete B", "concrete C"] },
    { "prompt": "...", "options": ["...", "...", "..."] },
    { "prompt": "...", "options": ["...", "...", "..."] }
  ]
}`;

export async function generateDiscoveryQuestions(input: {
  resumeText: string;
  persona: Persona;
  summary: string;
}): Promise<DiscoveryQuestion[]> {
  const { resumeText, persona, summary } = input;

  const user = `RESUME:
${resumeText.slice(0, 12000)}

PERSONA: ${PERSONA_LABELS[persona] ?? persona}

PROFESSIONAL SUMMARY: ${summary}

Write exactly 3 resume-specific multiple-choice questions, 3 options each.`;

  const result = await completeJSON<{
    questions?: Array<{ prompt?: string; options?: unknown }>;
  }>(QUESTIONS_SYSTEM, user, { temperature: 0.6 });

  const questions = (result.questions ?? [])
    .slice(0, 3)
    .map((q, i) => ({
      id: `q${i + 1}`,
      prompt: (q.prompt ?? "").trim(),
      options: toSkillList(q.options, 3),
    }))
    .filter((q) => q.prompt && q.options.length === 3);

  return questions;
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
