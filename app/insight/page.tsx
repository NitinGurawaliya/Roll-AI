import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, Target, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import { PersonaBadge } from "@/components/PersonaBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractUsablePaths } from "@/lib/progress";
import { PERSONA_DESCRIPTIONS, type Persona } from "@/lib/types";

export default async function InsightPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.userId },
  });
  if (!resume) redirect("/upload");

  // If they've already generated (current-shape) paths, jump them forward.
  const existingSession = await prisma.session.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { recommendations: true },
  });
  if (extractUsablePaths(existingSession?.recommendations).length > 0) {
    redirect("/recommendations");
  }

  const persona = resume.persona as Persona;
  const personaDescription = PERSONA_DESCRIPTIONS[persona];

  return (
    <div className="min-h-screen">
      <AppHeader name={session.name} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Stepper current="Insight" />

        <div className="mb-8">
          <PersonaBadge persona={persona} className="mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">
            We read your resume. Here&apos;s the real picture.
          </h1>
          {personaDescription && (
            <p className="mt-2 text-muted-foreground">{personaDescription}</p>
          )}
        </div>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-muted-foreground" />
                Professional summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{resume.summary}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-primary/30">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4 text-primary" />
                The opportunity worth naming
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-lg leading-relaxed">{resume.tension}</p>
            </CardContent>
          </Card>
        </div>

        {/* Exciting CTA into the dynamic questions step */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 text-center sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            3 quick questions, written from your resume
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight">
            Ready to see roles that actually fit you?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Answer three short, personalized questions and we&apos;ll match you to
            career paths — showing exactly which of your skills fit and what to
            learn next.
          </p>
          <Link
            href="/discovery"
            className={buttonVariants({ size: "lg" }) + " mt-5 gap-2"}
          >
            Let&apos;s go
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
