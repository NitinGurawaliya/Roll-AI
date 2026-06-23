import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { DiscoveryForm } from "@/components/DiscoveryForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractUsablePaths } from "@/lib/progress";
import type { DiscoveryQuestion } from "@/lib/types";

export default async function DiscoveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.userId },
  });
  if (!resume) redirect("/upload");

  // If the user already generated (current-shape) paths, send them there.
  const existingSession = await prisma.session.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { recommendations: true },
  });
  if (extractUsablePaths(existingSession?.recommendations).length > 0) {
    redirect("/recommendations");
  }

  const questions = (resume.questions as DiscoveryQuestion[] | null) ?? [];

  return (
    <div className="min-h-screen">
      <AppHeader name={session.name} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Stepper current="Questions" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Three questions, just for you
          </h1>
          <p className="mt-2 text-muted-foreground">
            We wrote these from your resume to sharpen your recommendations.
            Pick the option that fits best.
          </p>
        </div>
        <DiscoveryForm resumeId={resume.id} questions={questions} />
      </main>
    </div>
  );
}
