import { GlassCard } from "@/components/ui/glass-card";
import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { cn } from "@/lib/utils";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

export const QuizModule: BlockKindModule = {
  Render({ block, id }) {
    const question = getStr(block.payload, "question");
    const opts = block.payload["options"];
    const options = Array.isArray(opts) ? (opts as unknown[]) : [];
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
  },
  Edit({ payload, labels, onPatch }) {
    const raw =
      (payload["_optionsRaw"] as string | undefined) ??
      (Array.isArray(payload["options"])
        ? (payload["options"] as unknown[]).join("\n")
        : "");
    return (
      <div className="space-y-2">
        <GlassInput
          value={getStr(payload, "question")}
          onChange={(e) => onPatch({ question: e.target.value })}
          placeholder={labels.fieldQuestion}
          aria-label={labels.fieldQuestion}
        />
        <GlassTextarea
          rows={4}
          value={raw}
          onChange={(e) => onPatch({ _optionsRaw: e.target.value })}
          placeholder={labels.fieldOptions}
          aria-label={labels.fieldOptions}
        />
        <p className="text-[0.78rem] text-muted">{labels.fieldOptionsHelper}</p>
      </div>
    );
  },
  defaultPayload: () => ({ question: "", options: [], _optionsRaw: "" }),
  normalize(payload) {
    const raw = getStr(payload, "_optionsRaw");
    const fallback = Array.isArray(payload["options"])
      ? (payload["options"] as unknown[]).map(String)
      : [];
    const options = raw
      ? raw.split("\n").map((s) => s.trim()).filter((s) => s.length > 0)
      : fallback;
    return { question: getStr(payload, "question"), options };
  },
};
