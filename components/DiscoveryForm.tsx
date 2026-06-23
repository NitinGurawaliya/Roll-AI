"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DiscoveryQuestion } from "@/lib/types";

export function DiscoveryForm({
  resumeId,
  questions,
}: {
  resumeId: string;
  questions: DiscoveryQuestion[];
}) {
  const router = useRouter();
  // Map of question id -> selected option.
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = questions.filter((q) => selected[q.id]).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    try {
      const answers = questions.map((q) => ({
        question: q.prompt,
        answer: selected[q.id],
      }));

      const res = await fetch("/api/career/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, answers, excludedRoles: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate paths");

      router.push("/recommendations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load your questions. Please re-run the analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Progress
          value={(answeredCount / questions.length) * 100}
          className="h-2"
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {answeredCount}/{questions.length}
        </span>
      </div>

      {questions.map((q, i) => (
        <fieldset key={q.id} className="flex flex-col gap-3">
          <legend className="mb-1 text-lg font-semibold">
            <span className="text-muted-foreground">{i + 1}. </span>
            {q.prompt}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {q.options.map((opt) => {
              const isSelected = selected[q.id] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [q.id]: opt }))
                  }
                  className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span className={isSelected ? "font-medium" : ""}>{opt}</span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating your career paths…
          </>
        ) : (
          <>
            See my career paths
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
