"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DISCOVERY_QUESTIONS } from "@/lib/questions";

export function DiscoveryForm({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = DISCOVERY_QUESTIONS.filter((q) => answers[q.key]).length;
  const allAnswered = answeredCount === DISCOVERY_QUESTIONS.length;

  async function handleSubmit() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/career/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          answers: {
            likes: answers.likes,
            dislikes: answers.dislikes,
            priority: answers.priority,
          },
          excludedRoles: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate paths");

      router.push("/recommendations");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Progress
          value={(answeredCount / DISCOVERY_QUESTIONS.length) * 100}
          className="h-2"
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {answeredCount}/{DISCOVERY_QUESTIONS.length}
        </span>
      </div>

      {DISCOVERY_QUESTIONS.map((q, i) => (
        <fieldset key={q.key} className="flex flex-col gap-3">
          <legend className="mb-1 text-lg font-semibold">
            <span className="text-muted-foreground">{i + 1}. </span>
            {q.prompt}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((opt) => {
              const selected = answers[q.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.key]: opt }))
                  }
                  className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
                >
                  <span className={selected ? "font-medium" : ""}>{opt}</span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {selected && <Check className="size-3" />}
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
