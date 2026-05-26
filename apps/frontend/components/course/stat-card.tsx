import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <GlassCard variant="default" className={cn("h-full", className)}>
      <GlassCardContent className="flex h-full flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[color:var(--color-accent)]"
              style={{ background: "var(--color-accent-soft)" }}
              aria-hidden
            >
              {icon}
            </div>
          )}
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
            {label}
          </div>
        </div>
        <div className="font-display text-[2.2rem] leading-tight text-text">
          {value}
        </div>
        {hint && <div className="text-[0.82rem] text-text-soft">{hint}</div>}
      </GlassCardContent>
    </GlassCard>
  );
}
