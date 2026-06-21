import { useTranslations } from "next-intl";

import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";
import { PlayIcon } from "@/components/ui/icons";

import type { BlockKindModule } from "./types";
import { getBool, getStr } from "./utils";

export const SandboxModule: BlockKindModule = {
  Render({ block, id }) {
    const t = useTranslations("courseBuilder");
    const language = getStr(block.payload, "language");
    const code = getStr(block.payload, "code");
    const expectedOutput = getStr(block.payload, "expectedOutput");
    return (
      <div
        id={id}
        className="my-6 overflow-hidden rounded-[var(--r-lg)] border border-[color:var(--glass-border)]"
      >
        <div className="flex items-center justify-between border-b border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] px-4 py-2">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-muted">
            {language || t("sandbox.codeLabel")}
          </span>
          {/* Execution = v2 (hand-off §11.1). Placeholder for SandboxRunner. */}
          <button
            type="button"
            disabled
            title={t("sandbox.soon")}
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-[color:var(--glass-border)] px-3 py-1 text-[0.78rem] text-muted opacity-70"
          >
            <PlayIcon size={12} /> {t("sandbox.run")}
          </button>
        </div>
        <pre className="overflow-x-auto bg-[#1A1F2E] p-4 font-mono text-[0.85rem] leading-relaxed text-[#EDF1F9]">
          <code>{code}</code>
        </pre>
        {expectedOutput && (
          <div className="border-t border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] px-4 py-3 font-mono text-[0.8rem] text-text-soft">
            <span className="text-muted">→ </span>
            {expectedOutput}
          </div>
        )}
      </div>
    );
  },
  Edit({ payload, onPatch }) {
    const t = useTranslations("courseBuilder");
    return (
      <div className="space-y-2">
        <GlassInput
          value={getStr(payload, "language")}
          onChange={(e) => onPatch({ language: e.target.value })}
          placeholder={t("field.language")}
          aria-label={t("field.language")}
        />
        <GlassTextarea
          rows={6}
          value={getStr(payload, "code")}
          onChange={(e) => onPatch({ code: e.target.value })}
          placeholder={t("field.code")}
          aria-label={t("field.code")}
          className="font-mono text-[0.85rem]"
        />
        <GlassTextarea
          rows={2}
          value={getStr(payload, "expectedOutput")}
          onChange={(e) => onPatch({ expectedOutput: e.target.value })}
          placeholder={t("field.expectedOutput")}
          aria-label={t("field.expectedOutput")}
          className="font-mono text-[0.82rem]"
        />
        <label className="flex items-center gap-2 text-[0.85rem] text-text-soft">
          <input
            type="checkbox"
            checked={getBool(payload, "readonly")}
            onChange={(e) => onPatch({ readonly: e.target.checked })}
          />
          {t("field.readonly")}
        </label>
      </div>
    );
  },
  defaultPayload: () => ({
    language: "",
    code: "",
    readonly: true,
    expectedOutput: "",
  }),
  normalize(payload) {
    const out: Record<string, unknown> = {
      language: getStr(payload, "language"),
      code: getStr(payload, "code"),
      readonly: getBool(payload, "readonly"),
    };
    const expectedOutput = getStr(payload, "expectedOutput").trim();
    if (expectedOutput) out.expectedOutput = expectedOutput;
    return out;
  },
};
