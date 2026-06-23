import { GraduationCap, Repeat, TrendingUp } from "lucide-react";
import { PERSONA_LABELS, PERSONA_STYLES, type Persona } from "@/lib/types";

const ICONS: Record<Persona, typeof GraduationCap> = {
  RECENT_GRADUATE: GraduationCap,
  CAREER_PIVOT: Repeat,
  CAREER_GROWTH: TrendingUp,
};

export function PersonaBadge({
  persona,
  className = "",
}: {
  persona: Persona;
  className?: string;
}) {
  const Icon = ICONS[persona] ?? TrendingUp;
  const styles = PERSONA_STYLES[persona] ?? "";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${styles} ${className}`}
    >
      <Icon className="size-3.5" />
      {PERSONA_LABELS[persona] ?? persona}
    </span>
  );
}
