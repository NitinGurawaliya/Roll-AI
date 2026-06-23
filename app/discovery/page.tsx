import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { DiscoveryForm } from "@/components/DiscoveryForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DiscoveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.userId },
  });
  if (!resume) redirect("/upload");

  return (
    <div className="min-h-screen">
      <AppHeader name={session.name} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Stepper current="Questions" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Three quick questions
          </h1>
          <p className="mt-2 text-muted-foreground">
            These sharpen your recommendations. Pick the option that fits best.
          </p>
        </div>
        <DiscoveryForm resumeId={resume.id} />
      </main>
    </div>
  );
}
