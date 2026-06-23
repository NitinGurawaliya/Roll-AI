import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, Target } from "lucide-react";
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
import { PERSONA_DESCRIPTIONS, type Persona } from "@/lib/types";

export default async function InsightPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.userId },
  });
  if (!resume) redirect("/upload");

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
            Here&apos;s what your resume tells us
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent" />
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

        <div className="mt-10 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/upload"
            className={buttonVariants({ variant: "ghost" })}
          >
            Re-upload resume
          </Link>
          <Link
            href="/discovery"
            className={buttonVariants({ size: "lg" }) + " gap-2"}
          >
            Continue to a few quick questions
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
