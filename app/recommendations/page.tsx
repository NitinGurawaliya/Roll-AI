import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { RecommendationsView } from "@/components/RecommendationsView";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_ROUNDS, MAX_PATHS, CLOSING_MESSAGE } from "@/lib/constants";
import type { CareerPath, RecommendationRound } from "@/lib/types";

export default async function RecommendationsPage() {
  const auth = await getSession();
  if (!auth) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { userId: auth.userId },
  });
  if (!resume) redirect("/upload");

  const session = await prisma.session.findFirst({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  // No discovery session yet — go answer the questions.
  if (!session) redirect("/discovery");

  const rounds = (session.recommendations as RecommendationRound[] | null) ?? [];
  const paths: CareerPath[] = rounds.flatMap((r) => r.paths);

  // Edge case: session exists but generation never produced paths.
  if (paths.length === 0) redirect("/discovery");

  const shownCount = (session.shownRoles as string[])?.length ?? paths.length;
  const canGenerateMore =
    session.round < MAX_ROUNDS && shownCount < MAX_PATHS;

  return (
    <div className="min-h-screen">
      <AppHeader name={auth.name} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Stepper current="Paths" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Your personalized career paths
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ranked by fit against your resume, persona, and preferences. Pick
            one to get a focused 90-day plan — or generate another round.
          </p>
        </div>

        <RecommendationsView
          resumeId={resume.id}
          initialPaths={paths}
          initialRound={session.round}
          initialCanGenerateMore={canGenerateMore}
          initialClosingMessage={canGenerateMore ? null : CLOSING_MESSAGE}
        />
      </main>
    </div>
  );
}
