import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { PersonaBadge } from "@/components/PersonaBadge";
import { RecommendationsView } from "@/components/RecommendationsView";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractUsablePaths } from "@/lib/progress";
import { MAX_ROUNDS, MAX_PATHS, CLOSING_MESSAGE } from "@/lib/constants";
import type { Persona } from "@/lib/types";

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

  // Keep only paths in the current shape (with skill arrays); legacy rows are
  // dropped so the UI never renders blanks.
  const paths = extractUsablePaths(session.recommendations);

  // No usable paths (none yet, or only legacy rows) — regenerate via discovery.
  if (paths.length === 0) redirect("/discovery");

  const canGenerateMore =
    session.round < MAX_ROUNDS && paths.length < MAX_PATHS;

  return (
    <div className="min-h-screen">
      <AppHeader name={auth.name} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Stepper current="Paths" />

        {/* Personalized opening message from the coach, naming the tension,
            shown right before the path cards. */}
        <div className="mb-8 flex gap-3 sm:gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Compass className="size-5" />
          </span>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border bg-card p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold">Your career coach</span>
              <PersonaBadge persona={resume.persona as Persona} />
            </div>
            {resume.tension && (
              <p className="leading-relaxed">{resume.tension}</p>
            )}
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Based on your background and what you told me, here are{" "}
              <span className="font-medium text-foreground">
                3 career paths
              </span>{" "}
              I think fit you best. Each one shows the skills you already have
              and what you&apos;d need to learn. Pick the one that excites you —
              or ask me for a different set.
            </p>
          </div>
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
