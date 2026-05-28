import type { CourseBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BlockTocProps {
  blocks: CourseBlock[];
  className?: string;
  label?: string;
}

export function blockSlug(block: CourseBlock): string {
  return `block-${block.id}`;
}

export function BlockToc({ blocks, className, label = "Sommaire" }: BlockTocProps) {
  const headings = blocks.filter(
    (b) => b.kind === "H1" || b.kind === "H2" || b.kind === "H3"
  );

  if (headings.length === 0) return null;

  return (
    <nav aria-label={label} className={cn("text-[0.88rem]", className)}>
      <div className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {label}
      </div>
      <ul className="space-y-1.5">
        {headings.map((h) => {
          const text = (() => {
            const p = h.payload ?? {};
            const t = (p["text"] ?? p["content"]) as unknown;
            return typeof t === "string" ? t : "";
          })();
          const indent =
            h.kind === "H2" ? "pl-3" : h.kind === "H3" ? "pl-6" : "";
          return (
            <li key={h.id}>
              <a
                href={`#${blockSlug(h)}`}
                className={cn(
                  "block rounded-[var(--r-sm)] py-1 text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text",
                  indent
                )}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
