import { GlassCard } from "@/components/ui/glass-card";
import { GlassSelect, GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

const TONE_BG: Record<string, string> = {
  warning: "color-mix(in oklab, var(--color-warning) 14%, transparent)",
  danger: "color-mix(in oklab, var(--color-danger) 14%, transparent)",
};

export const CalloutModule: BlockKindModule = {
  Render({ block, id }) {
    const tone = getStr(block.payload, "tone");
    return (
      <GlassCard
        id={id}
        variant="tinted"
        className="my-6 p-5"
        style={{ background: TONE_BG[tone] ?? "var(--color-accent-soft)" }}
      >
        <div className="text-[0.95rem] leading-relaxed text-text">
          {getStr(block.payload, "text")}
        </div>
      </GlassCard>
    );
  },
  Edit({ payload, labels, onPatch }) {
    return (
      <div className="space-y-2">
        <GlassTextarea
          rows={3}
          value={getStr(payload, "text")}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder={labels.fieldText}
          aria-label={labels.fieldText}
        />
        <GlassSelect
          value={getStr(payload, "tone") || "neutral"}
          onChange={(e) => onPatch({ tone: e.target.value })}
          aria-label={labels.fieldTone}
        >
          <option value="neutral">{labels.toneNeutral}</option>
          <option value="warning">{labels.toneWarning}</option>
          <option value="danger">{labels.toneDanger}</option>
        </GlassSelect>
      </div>
    );
  },
  defaultPayload: () => ({ text: "", tone: "neutral" }),
};
