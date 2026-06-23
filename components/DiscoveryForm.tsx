"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DISCOVERY_QUESTIONS } from "@/lib/questions";

export function DiscoveryForm({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = DISCOVERY_QUESTIONS.every((q) => answers[q.key]);

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
      {DISCOVERY_QUESTIONS.map((q, i) => (
        <fieldset key={q.key} className="flex flex-col gap-3">
          <legend className="mb-1 text-lg font-semibold">
            <span className="text-muted-foreground">{i + 1}. </span>
            {q.prompt}
          </legend>
          <div className="flex flex-wrap gap-2">
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
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
      >
        {submitting ? "Generating your career paths…" : "See my career paths"}
      </Button>
    </div>
  );
}
