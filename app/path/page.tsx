import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CircleCheck,
  Target,
  TriangleAlert,
  ListChecks,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Stepper } from "@/components/Stepper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePathDetail } from "@/lib/career";
import type {
  CareerPath,
  Persona,
  RecommendationRound,
} from "@/lib/types";

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const ROADMAP_STAGES = [
  { key: "first30", label: "First 30 days", sub: "Orient & build foundations" },
  { key: "days30to60", label: "Days 30–60", sub: "Apply & gain momentum" },
  { key: "days60to90", label: "Days 60–90", sub: "Demonstrate & level up" },
] as const;

export default async function PathPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  const auth = await getSession();
  if (!auth) redirect("/login");

  const { title } = await searchParams;
  if (!title) redirect("/recommendations");

  const resume = await prisma.resume.findUnique({
    where: { userId: auth.userId },
  });
  if (!resume) redirect("/upload");

  const sessionRow = await prisma.session.findFirst({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!sessionRow) redirect("/discovery");

  const rounds =
    (sessionRow.recommendations as RecommendationRound[] | null) ?? [];
  const allPaths: CareerPath[] = rounds.flatMap((r) => r.paths);
  const chosen = allPaths.find(
    (p) => p.title.toLowerCase() === title.toLowerCase()
  );
  if (!chosen) redirect("/recommendations");

  const detail = await generatePathDetail({
    resumeText: resume.rawText,
    persona: resume.persona as Persona,
    summary: resume.summary ?? "",
    pathTitle: chosen.title,
  });

  return (
    <div className="min-h-screen">
      <AppHeader name={auth.name} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Stepper current="Plan" />

        <Link
          href="/recommendations"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to all paths
        </Link>

        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/8 to-transparent p-6">
          <p className="text-sm font-medium text-primary">Your chosen path</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {chosen.title}
          </h1>
          <p className="mt-3 leading-relaxed">{detail.whyItFits}</p>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CircleCheck className="size-4 text-emerald-600" />
                  Existing strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CheckList items={detail.existingStrengths} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TriangleAlert className="size-4 text-amber-600" />
                  Skill gaps to close
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CheckList items={detail.skillGaps} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="size-4 text-primary" />
                Start this week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CheckList items={detail.nextSteps} />
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="size-4 text-primary" />
                Your 90-day roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative ml-2 border-l border-border">
                {ROADMAP_STAGES.map((stage, i) => {
                  const items = detail.roadmap[stage.key];
                  return (
                    <li key={stage.key} className="ml-6 pb-8 last:pb-0">
                      <span className="absolute -left-[9px] flex size-[18px] items-center justify-center rounded-full border-2 border-primary bg-background text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <h3 className="font-semibold leading-none">
                        {stage.label}
                      </h3>
                      <p className="mb-3 mt-1 text-xs text-muted-foreground">
                        {stage.sub}
                      </p>
                      <CheckList items={items} />
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/recommendations"
            className={buttonVariants({ variant: "outline" }) + " gap-1.5"}
          >
            <ArrowLeft className="size-4" />
            Explore other paths
          </Link>
        </div>
      </main>
    </div>
  );
}
