import { completeJSON } from "@/lib/openai";
import type { Persona, ResumeAnalysis } from "@/lib/types";

const VALID_PERSONAS: Persona[] = [
  "RECENT_GRADUATE",
  "CAREER_PIVOT",
  "CAREER_GROWTH",
];

const ANALYSIS_SYSTEM = `You are a sharp, direct career coach who reads resumes and gives people honest clarity about where they stand.

Given a resume, you produce three things:

1. persona — classify the person into exactly ONE of:
   - "RECENT_GRADUATE": ~0-1 year experience or fresh graduate, overwhelmed by options, needs to pick a lane.
   - "CAREER_PIVOT": wants to move into a different function; looking for ownership and growth across domains.
   - "CAREER_GROWTH": solid in their current field and wants to level up within the same domain.

2. summary — a tight 2-3 sentence structured summary of who this person is professionally: their level, core skills, and what stands out. Reference specifics from the resume (companies, roles, technologies).

3. tension — a single sharp, specific 1-2 sentence statement naming ONE real career tension or opportunity you see. It must reference something concrete from THIS resume, not generic advice. Example tone: "You've built multiple real-world applications and have stronger practical experience than many graduates, but most hiring processes will still evaluate you as an entry-level candidate."

Return ONLY valid JSON in this exact shape:
{
  "persona": "RECENT_GRADUATE" | "CAREER_PIVOT" | "CAREER_GROWTH",
  "summary": "...",
  "tension": "..."
}`;

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const trimmed = resumeText.slice(0, 15000);

  const result = await completeJSON<Partial<ResumeAnalysis>>(
    ANALYSIS_SYSTEM,
    `Here is the resume:\n\n${trimmed}`
  );

  const persona = VALID_PERSONAS.includes(result.persona as Persona)
    ? (result.persona as Persona)
    : "CAREER_GROWTH";

  return {
    persona,
    summary: result.summary?.trim() || "No summary available.",
    tension: result.tension?.trim() || "No career tension identified.",
  };
}
