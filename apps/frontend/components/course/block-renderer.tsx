import { GlassCard } from "@/components/ui/glass-card";
import type { CourseBlock, CourseBlockKind } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BlockRendererProps {
  block: CourseBlock;
  id?: string;
}

function getStr(payload: Record<string, unknown>, key: string): string {
  const v = payload[key];
  return typeof v === "string" ? v : "";
}

function safeUrl(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    return "";
  }
  return "";
}

const HEADING_CLASS: Record<"H1" | "H2" | "H3", string> = {
  H1: "font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight text-text mt-12 mb-4 scroll-mt-24",
  H2: "font-display text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-text mt-10 mb-3 scroll-mt-24",
  H3: "font-display text-[1.2rem] text-text mt-8 mb-2 scroll-mt-24",
};

export function BlockRenderer({ block, id }: BlockRendererProps) {
  const p = block.payload ?? {};
  const kind = block.kind as CourseBlockKind;

  if (kind === "H1" || kind === "H2" || kind === "H3") {
    const Tag = kind === "H1" ? "h1" : kind === "H2" ? "h2" : "h3";
    return (
      <Tag id={id} className={HEADING_CLASS[kind]}>
        {getStr(p, "text") || getStr(p, "content")}
      </Tag>
    );
  }

  if (kind === "P") {
    return (
      <p id={id} className="my-4 text-[1rem] leading-[1.75] text-text-soft">
        {getStr(p, "text") || getStr(p, "content")}
      </p>
    );
  }

  if (kind === "CODE") {
    return (
      <pre
        id={id}
        className="my-6 overflow-x-auto rounded-[var(--r)] border border-[color:var(--glass-border)] bg-[color:color-mix(in_oklab,var(--text)_92%,transparent)] p-4 font-mono text-[0.85rem] leading-relaxed text-white"
      >
        <code>{getStr(p, "code") || getStr(p, "content")}</code>
      </pre>
    );
  }

  if (kind === "CALLOUT") {
    const tone = getStr(p, "tone");
    const bg = tone === "warning"
      ? "color-mix(in oklab, var(--color-warning) 14%, transparent)"
      : tone === "danger"
      ? "color-mix(in oklab, var(--color-danger) 14%, transparent)"
      : "var(--color-accent-soft)";
    return (
      <GlassCard
        id={id}
        variant="tinted"
        className="my-6 p-5"
        style={{ background: bg }}
      >
        <div className="text-[0.95rem] leading-relaxed text-text">
          {getStr(p, "text") || getStr(p, "content")}
        </div>
      </GlassCard>
    );
  }

  if (kind === "IMAGE") {
    const src = safeUrl(getStr(p, "src") || getStr(p, "url"));
    const alt = getStr(p, "alt");
    return (
      <figure id={id} className="my-6">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="w-full rounded-[var(--r-lg)] border border-[color:var(--glass-border)]"
          />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)] text-muted">
            Image
          </div>
        )}
        {alt && (
          <figcaption className="mt-2 text-center text-[0.82rem] text-muted">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }

  if (kind === "AUDIO" || kind === "VIDEO") {
    const src = safeUrl(getStr(p, "src") || getStr(p, "url"));
    return (
      <div id={id} className="my-6">
        {!src ? (
          <div className="aspect-video rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)]" />
        ) : kind === "AUDIO" ? (
          <audio controls src={src} className="w-full" />
        ) : (
          <video controls src={src} className="w-full rounded-[var(--r-lg)]" />
        )}
      </div>
    );
  }

  if (kind === "QUIZ") {
    const question = getStr(p, "question");
    const options = Array.isArray(p["options"]) ? (p["options"] as unknown[]) : [];
    return (
      <GlassCard id={id} variant="default" className="my-6 p-5">
        <div className="font-display text-[1.15rem] text-text">{question}</div>
        <ul className="mt-4 space-y-2">
          {options.map((opt, i) => (
            <li
              key={i}
              className={cn(
                "rounded-[var(--r)] border border-[color:var(--glass-border)] px-4 py-2.5 text-[0.92rem] text-text-soft",
                "hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
              )}
            >
              {typeof opt === "string" ? opt : JSON.stringify(opt)}
            </li>
          ))}
        </ul>
      </GlassCard>
    );
  }

  return null;
}
