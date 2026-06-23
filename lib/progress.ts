import { prisma } from "@/lib/prisma";
import type { CareerPath, RecommendationRound } from "@/lib/types";

/**
 * Extract only career paths in the current shape (with skill arrays).
 * Legacy rows from before the skills redesign are dropped, so stale sessions
 * are treated as "no paths yet" rather than rendering blank cards.
 */
export function extractUsablePaths(recommendations: unknown): CareerPath[] {
  const rounds = (recommendations as RecommendationRound[] | null) ?? [];
  return rounds
    .flatMap((r) => r?.paths ?? [])
    .filter(
      (p): p is CareerPath =>
        !!p &&
        (Array.isArray(p.matchedSkills) || Array.isArray(p.missingSkills))
    )
    .map((p) => ({
      title: p.title,
      score: p.score,
      matchedSkills: p.matchedSkills ?? [],
      missingSkills: p.missingSkills ?? [],
    }));
}

/**
 * Resolve the furthest step a user has reached, so returning users land where
 * they left off instead of restarting the flow.
 *
 * - No resume            -> /upload
 * - Resume, no paths yet  -> /insight (then they continue to /discovery)
 * - Has generated paths   -> /recommendations
 */
export async function resolveFurthestStep(userId: string): Promise<string> {
  const resume = await prisma.resume.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!resume) return "/upload";

  const session = await prisma.session.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { recommendations: true },
  });

  const hasPaths = extractUsablePaths(session?.recommendations).length > 0;

  return hasPaths ? "/recommendations" : "/insight";
}
