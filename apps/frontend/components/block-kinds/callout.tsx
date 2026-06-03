import { useTranslations } from "next-intl";

import { GlassSelect, GlassTextarea } from "@/components/ui/glass-input";

import { TONE_ORDER, toneSpec } from "./tones";
import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

export const CalloutModule: BlockKindModule = {
  Render({ block, id }) {
    const spec = toneSpec(getStr(block.payload, "tone"));
    const Icon = spec.icon;
    return (
      <aside
        id={id}
        className="my-6 flex gap-3 rounded-[var(--r-lg)] border p-5 backdrop-blur-md"
        style={{
          borderColor: `color-mix(in oklab, ${spec.color} 45%, transparent)`,
          background: `color-mix(in oklab, ${spec.color} 12%, var(--glass-bg))`,
        }}
      >
        <span className="mt-0.5 shrink-0" style={{ color: spec.color }} aria-hidden>
          <Icon size={20} />
        </span>
        <div className="text-[0.95rem] leading-relaxed text-text">
          {getStr(block.payload, "text")}
        </div>
      </aside>
    );
  },
  Edit({ payload, onPatch }) {
    const t = useTranslations("courseBuilder");
    return (
      <div className="space-y-2">
        <GlassTextarea
          rows={3}
          value={getStr(payload, "text")}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder={t("field.text")}
          aria-label={t("field.text")}
        />
        <GlassSelect
          value={getStr(payload, "tone") || "neutral"}
          onChange={(e) => onPatch({ tone: e.target.value })}
          aria-label={t("field.tone")}
        >
          {TONE_ORDER.map((tone) => (
            <option key={tone} value={tone}>
              {toneSpec(tone).emoji} {t(`tone.${tone}`)}
            </option>
          ))}
        </GlassSelect>
      </div>
    );
  },
  defaultPayload: () => ({ text: "", tone: "neutral" }),
  normalize(payload) {
    const tone = getStr(payload, "tone") || "neutral";
    return { text: getStr(payload, "text"), tone };
  },
};
