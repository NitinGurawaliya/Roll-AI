/** Compact circular match-score indicator. */
export function ScoreRing({
  score,
  size = 52,
}: {
  score: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  // Color shifts with strength of fit.
  const color =
    clamped >= 90
      ? "var(--primary)"
      : clamped >= 80
        ? "oklch(0.62 0.21 277)"
        : "oklch(0.6 0.13 250)";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Match score ${clamped} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {clamped}
      </span>
    </div>
  );
}
