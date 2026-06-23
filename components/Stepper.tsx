import { Check } from "lucide-react";

const STEPS = ["Upload", "Insight", "Questions", "Paths", "Plan"] as const;

export type FlowStep = (typeof STEPS)[number];

export function Stepper({ current }: { current: FlowStep }) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  aria-current={active ? "step" : undefined}
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={`hidden text-sm sm:inline ${
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`mx-2 h-px flex-1 ${
                    done ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
