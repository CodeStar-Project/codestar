import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <GlassCard variant="plain" className={cn("p-10 text-center", className)}>
      {icon && (
        <div
          className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-[color:var(--color-accent)]"
          style={{ background: "var(--color-accent-soft)" }}
          aria-hidden
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-[1.4rem] text-text">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-[0.95rem] text-text-soft">
          {description}
        </p>
      )}
      {action && <div className="mt-6 inline-flex">{action}</div>}
    </GlassCard>
  );
}
