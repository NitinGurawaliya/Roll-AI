"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import type { CareerPath } from "@/lib/types";

interface Props {
  resumeId: string;
  initialPaths: CareerPath[];
  initialRound: number;
  initialCanGenerateMore: boolean;
  initialClosingMessage: string | null;
}

export function RecommendationsView({
  resumeId,
  initialPaths,
  initialRound,
  initialCanGenerateMore,
  initialClosingMessage,
}: Props) {
  const router = useRouter();
  const [paths, setPaths] = useState<CareerPath[]>(initialPaths);
  const [round, setRound] = useState(initialRound);
  const [canGenerateMore, setCanGenerateMore] = useState(
    initialCanGenerateMore
  );
  const [closingMessage, setClosingMessage] = useState<string | null>(
    initialClosingMessage
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  async function generateMore() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/career/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          answers: {},
          excludedRoles: paths.map((p) => p.title),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setPaths((prev) => [...prev, ...(data.paths as CareerPath[])]);
      setRound(data.round);
      setCanGenerateMore(data.canGenerateMore);
      setClosingMessage(data.closingMessage ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function selectPath(title: string) {
    setSelecting(title);
    router.push(`/path?title=${encodeURIComponent(title)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {paths.length} path{paths.length === 1 ? "" : "s"} explored
        </span>
        <span>Round {round} of 3</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {paths.map((path, idx) => (
          <Card
            key={path.title}
            className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3 p-5 pb-0">
              <ScoreRing score={path.score} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Match #{idx + 1}
                </p>
                <h3 className="text-lg font-semibold leading-tight">
                  {path.title}
                </h3>
              </div>
            </div>

            <CardContent className="flex flex-1 flex-col gap-4 pt-4">
              {path.reason && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {path.reason}
                </p>
              )}

              {path.strengths.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {path.strengths.map((s, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {path.growth && (
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm">
                  <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{path.growth}</span>
                </div>
              )}

              <div className="mt-auto pt-1">
                <Button
                  className="w-full gap-1.5"
                  variant="outline"
                  onClick={() => selectPath(path.title)}
                  disabled={!!selecting}
                >
                  {selecting === path.title ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Building your plan…
                    </>
                  ) : (
                    <>
                      Select this path
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {closingMessage ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="whitespace-pre-line py-6 text-center leading-relaxed text-muted-foreground">
            {closingMessage}
          </CardContent>
        </Card>
      ) : (
        canGenerateMore && (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={generateMore}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating more paths…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate 3 more paths
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Not quite right? We&apos;ll explore a different set.
            </p>
          </div>
        )
      )}
    </div>
  );
}
