import { cn } from "@/lib/utils";

export interface SectionLabelProps {
  index: string;
  label: string;
  className?: string;
}

export function SectionLabel({ index, label, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-ink-2",
        className
      )}
    >
      <span className="text-brand leading-none">●</span>
      <span className="font-mono text-ink-3">{index}</span>
      <span className="h-px w-10 bg-line-strong" />
      <span>{label}</span>
    </div>
  );
}
