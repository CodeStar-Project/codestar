import { cn } from "@/lib/utils";

interface PageHeaderProps {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {kicker && (
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            {kicker}
          </div>
        )}
        <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[1rem] text-text-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
