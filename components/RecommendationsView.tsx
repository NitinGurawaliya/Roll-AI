"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {paths.length} path{paths.length === 1 ? "" : "s"} · round {round} of 3
        </p>
        <div className="w-32">
          <Progress value={(Math.min(paths.length, 9) / 9) * 100} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paths.map((path) => (
          <Card key={path.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{path.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  {path.score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              {path.reason && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {path.reason}
                </p>
              )}
              {path.strengths.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Key strengths
                  </p>
                  <ul className="list-inside list-disc text-sm">
                    {path.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {path.growth && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Growth potential
                  </p>
                  <p className="text-sm">{path.growth}</p>
                </div>
              )}
              <div className="mt-auto pt-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => selectPath(path.title)}
                  disabled={!!selecting}
                >
                  {selecting === path.title
                    ? "Building your plan…"
                    : "Select this path"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {closingMessage ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="whitespace-pre-line py-6 text-center leading-relaxed">
            {closingMessage}
          </CardContent>
        </Card>
      ) : (
        canGenerateMore && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={generateMore}
              disabled={loading}
            >
              {loading ? "Generating more paths…" : "Generate 3 more paths"}
            </Button>
          </div>
        )
      )}
    </div>
  );
}
