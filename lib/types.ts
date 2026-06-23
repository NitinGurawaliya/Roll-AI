/** Shared domain types for Career Compass AI. */

export type Persona = "RECENT_GRADUATE" | "CAREER_PIVOT" | "CAREER_GROWTH";

export const PERSONA_LABELS: Record<Persona, string> = {
  RECENT_GRADUATE: "Recent Graduate",
  CAREER_PIVOT: "Career Pivot",
  CAREER_GROWTH: "Career Growth",
};

/** Tailwind classes for persona accent chips (kept token-light for theming). */
export const PERSONA_STYLES: Record<Persona, string> = {
  RECENT_GRADUATE:
    "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
  CAREER_PIVOT:
    "bg-violet-500/12 text-violet-700 ring-violet-500/25 dark:text-violet-300",
  CAREER_GROWTH:
    "bg-blue-500/12 text-blue-700 ring-blue-500/25 dark:text-blue-300",
};

export const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  RECENT_GRADUATE:
    "Less than ~1 year of experience. Overwhelmed by options and looking for structured guidance to pick a lane.",
  CAREER_PIVOT:
    "Wants to move into a different function. Looking for ownership, growth, and a clear path across.",
  CAREER_GROWTH:
    "Wants to level up within the current field and needs help identifying the growth gap.",
};

export interface ResumeAnalysis {
  persona: Persona;
  summary: string;
  tension: string;
}

/** A dynamically generated discovery question grounded in the resume. */
export interface DiscoveryQuestion {
  id: string;
  prompt: string;
  options: string[];
}

/** One answered question/answer pair stored for a session. */
export interface DiscoveryAnswer {
  question: string;
  answer: string;
}

/** All answers for a recommendation session (dynamic Q&A pairs). */
export type DiscoveryAnswers = DiscoveryAnswer[];

/**
 * A single recommended career path.
 * The card shows the match score plus the user's matched skills (have) and
 * missing skills (to learn) — no prose.
 */
export interface CareerPath {
  title: string;
  score: number;
  /** Skills the user already has (from their resume) that fit this role. */
  matchedSkills: string[];
  /** Skills this role needs that are absent from the resume. */
  missingSkills: string[];
}

/** One round of recommendations stored in Session.recommendations. */
export interface RecommendationRound {
  round: number;
  paths: CareerPath[];
}

/** Detailed analysis shown after a user selects a path. */
export interface PathDetail {
  whyItFits: string;
  existingStrengths: string[];
  skillGaps: string[];
  nextSteps: string[];
  roadmap: {
    first30: string[];
    days30to60: string[];
    days60to90: string[];
  };
}
