import { cn } from "@/lib/utils";
import { parseProgress, formatPercent } from "@/lib/format";

interface ProgressBarProps {
  progress: string | number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  progress,
  className,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const value = parseProgress(progress);
  const pct = Math.round(value * 100);
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-[color:var(--glass-border)]",
          height
        )}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--color-accent), color-mix(in oklab, var(--color-accent) 70%, white))",
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-[0.78rem] text-muted">{formatPercent(value)}</div>
      )}
    </div>
  );
}
