export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeResume } from "@/lib/analyze";
import { generateDiscoveryQuestions } from "@/lib/career";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromPdf(buffer);

    if (!rawText || rawText.length < 30) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF" },
        { status: 400 }
      );
    }

    // Analyze: persona + summary + tension.
    const analysis = await analyzeResume(rawText);

    // Generate dynamic, resume-specific discovery questions up front so the
    // discovery step and recommendation step share the same set.
    const questions = await generateDiscoveryQuestions({
      resumeText: rawText,
      persona: analysis.persona,
      summary: analysis.summary,
    });

    // One resume per user — upsert on the unique userId.
    const resume = await prisma.resume.upsert({
      where: { userId: session.userId },
      update: {
        rawText,
        persona: analysis.persona,
        summary: analysis.summary,
        tension: analysis.tension,
        questions: questions as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId: session.userId,
        rawText,
        persona: analysis.persona,
        summary: analysis.summary,
        tension: analysis.tension,
        questions: questions as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      resumeId: resume.id,
      persona: resume.persona,
      summary: resume.summary,
      tension: resume.tension,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
