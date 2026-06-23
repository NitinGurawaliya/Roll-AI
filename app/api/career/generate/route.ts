export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateCareerPaths } from "@/lib/career";
import { MAX_ROUNDS, MAX_PATHS, CLOSING_MESSAGE } from "@/lib/constants";
import type {
  CareerPath,
  DiscoveryAnswers,
  Persona,
  RecommendationRound,
} from "@/lib/types";

interface GenerateBody {
  resumeId?: string;
  answers?: DiscoveryAnswers;
  excludedRoles?: string[];
}

function normalizeAnswers(value: unknown): DiscoveryAnswers {
  if (!Array.isArray(value)) return [];
  return value
    .map((a) => ({
      question: String((a as { question?: unknown })?.question ?? "").trim(),
      answer: String((a as { answer?: unknown })?.answer ?? "").trim(),
    }))
    .filter((a) => a.question && a.answer);
}

function uniqueTitles(titles: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of titles) {
    const key = t.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(t.trim());
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  const auth = await getSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as GenerateBody;
    const excludedRoles = Array.isArray(body.excludedRoles)
      ? body.excludedRoles
      : [];

    const resume = await prisma.resume.findUnique({
      where: { userId: auth.userId },
    });
    if (!resume) {
      return NextResponse.json({ error: "No resume found" }, { status: 404 });
    }
    if (body.resumeId && body.resumeId !== resume.id) {
      return NextResponse.json({ error: "Resume mismatch" }, { status: 403 });
    }

    // First round if no roles have been shown yet; otherwise continue the
    // user's most recent session.
    const isFirstRound = excludedRoles.length === 0;
    const latest = await prisma.session.findFirst({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    const incomingAnswers: DiscoveryAnswers = normalizeAnswers(body.answers);

    let sessionRow = isFirstRound || !latest ? null : latest;

    if (!sessionRow) {
      sessionRow = await prisma.session.create({
        data: {
          userId: auth.userId,
          answers: incomingAnswers as unknown as Prisma.InputJsonValue,
          shownRoles: [],
          recommendations: [],
          round: 0,
        },
      });
    }

    // Prefer the answers already stored on the session; fall back to incoming.
    const storedAnswers = normalizeAnswers(sessionRow.answers);
    const answers = storedAnswers.length ? storedAnswers : incomingAnswers;
    const shownSoFar = (sessionRow.shownRoles as string[]) ?? [];
    const priorRounds = (sessionRow.recommendations as
      | RecommendationRound[]
      | null) ?? [];
    const currentRound = sessionRow.round;

    // Enforce loop limits before spending a model call.
    if (currentRound >= MAX_ROUNDS || shownSoFar.length >= MAX_PATHS) {
      return NextResponse.json({
        sessionId: sessionRow.id,
        paths: [],
        round: currentRound,
        totalPaths: shownSoFar.length,
        canGenerateMore: false,
        closingMessage: CLOSING_MESSAGE,
      });
    }

    const allExcluded = uniqueTitles([...excludedRoles, ...shownSoFar]);

    const paths: CareerPath[] = await generateCareerPaths({
      resumeText: resume.rawText,
      persona: resume.persona as Persona,
      summary: resume.summary ?? "",
      tension: resume.tension ?? "",
      answers,
      excludedRoles: allExcluded,
    });

    // Defensively drop any path that slipped through against the exclude list.
    const excludedSet = new Set(allExcluded.map((r) => r.toLowerCase()));
    const freshPaths = paths.filter(
      (p) => !excludedSet.has(p.title.toLowerCase())
    );

    const newRound = currentRound + 1;
    const newShown = uniqueTitles([
      ...shownSoFar,
      ...freshPaths.map((p) => p.title),
    ]);
    const newRecommendations: RecommendationRound[] = [
      ...priorRounds,
      { round: newRound, paths: freshPaths },
    ];

    await prisma.session.update({
      where: { id: sessionRow.id },
      data: {
        answers: answers as unknown as Prisma.InputJsonValue,
        round: newRound,
        shownRoles: newShown,
        recommendations:
          newRecommendations as unknown as Prisma.InputJsonValue,
      },
    });

    const canGenerateMore =
      newRound < MAX_ROUNDS && newShown.length < MAX_PATHS;

    return NextResponse.json({
      sessionId: sessionRow.id,
      paths: freshPaths,
      round: newRound,
      totalPaths: newShown.length,
      canGenerateMore,
      closingMessage: canGenerateMore ? null : CLOSING_MESSAGE,
    });
  } catch (error) {
    console.error("Career generate error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
