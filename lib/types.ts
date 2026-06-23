/** Shared domain types for Career Compass AI. */

export type Persona = "RECENT_GRADUATE" | "CAREER_PIVOT" | "CAREER_GROWTH";

export const PERSONA_LABELS: Record<Persona, string> = {
  RECENT_GRADUATE: "Recent Graduate",
  CAREER_PIVOT: "Career Pivot",
  CAREER_GROWTH: "Career Growth",
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

/** Discovery question answers for a recommendation session. */
export interface DiscoveryAnswers {
  likes: string;
  dislikes: string;
  priority: string;
}

/** A single recommended career path (recommendation round). */
export interface CareerPath {
  title: string;
  score: number;
  reason: string;
  growth: string;
  strengths: string[];
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
