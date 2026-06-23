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
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePathDetail } from "@/lib/career";
import type {
  CareerPath,
  Persona,
  RecommendationRound,
} from "@/lib/types";

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

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

  // Verify the chosen title is actually one we recommended.
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
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/recommendations"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to all paths
        </Link>

        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Your chosen path</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {chosen.title}
          </h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Why this path fits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{detail.whyItFits}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing strengths</CardTitle>
                <CardDescription>What you already bring.</CardDescription>
              </CardHeader>
              <CardContent>
                <List items={detail.existingStrengths} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skill gaps</CardTitle>
                <CardDescription>What to close.</CardDescription>
              </CardHeader>
              <CardContent>
                <List items={detail.skillGaps} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Suggested next steps</CardTitle>
              <CardDescription>Start this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <List items={detail.nextSteps} />
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Your 90-day roadmap</CardTitle>
              <CardDescription>
                A focused plan to build momentum.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <h3 className="mb-3 font-semibold">First 30 days</h3>
                <List items={detail.roadmap.first30} />
              </div>
              <Separator />
              <div>
                <h3 className="mb-3 font-semibold">Days 30–60</h3>
                <List items={detail.roadmap.days30to60} />
              </div>
              <Separator />
              <div>
                <h3 className="mb-3 font-semibold">Days 60–90</h3>
                <List items={detail.roadmap.days60to90} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/recommendations"
            className={buttonVariants({ variant: "outline" })}
          >
            Explore other paths
          </Link>
        </div>
      </main>
    </div>
  );
}
