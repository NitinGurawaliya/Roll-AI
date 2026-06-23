import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERSONA_LABELS, PERSONA_DESCRIPTIONS, type Persona } from "@/lib/types";

export default async function InsightPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const resume = await prisma.resume.findUnique({
    where: { userId: session.userId },
  });

  // No resume yet — send them to upload.
  if (!resume) redirect("/upload");

  const persona = resume.persona as Persona;
  const personaLabel = PERSONA_LABELS[persona] ?? resume.persona;
  const personaDescription = PERSONA_DESCRIPTIONS[persona];

  return (
    <div className="min-h-screen">
      <AppHeader name={session.name} />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            Your career persona: {personaLabel}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Here&apos;s what your resume tells us
          </h1>
          {personaDescription && (
            <p className="mt-2 text-muted-foreground">{personaDescription}</p>
          )}
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional summary</CardTitle>
              <CardDescription>How we read your background.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{resume.summary}</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>The opportunity worth naming</CardTitle>
              <CardDescription>
                The one tension we think you should act on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{resume.tension}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex items-center justify-between gap-3">
          <Link
            href="/upload"
            className={buttonVariants({ variant: "ghost" })}
          >
            Re-upload resume
          </Link>
          <Link
            href="/discovery"
            className={buttonVariants({ size: "lg" })}
          >
            Continue to a few quick questions
          </Link>
        </div>
      </main>
    </div>
  );
}
