import { useTranslations } from "next-intl";

import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

export const CodeModule: BlockKindModule = {
  Render({ block, id }) {
    return (
      <pre
        id={id}
        className="my-6 overflow-x-auto rounded-[var(--r)] border border-[color:var(--glass-border)] bg-[#1A1F2E] p-4 font-mono text-[0.85rem] leading-relaxed text-[#EDF1F9]"
      >
        <code>{getStr(block.payload, "code")}</code>
      </pre>
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
      </div>
    );
  },
  defaultPayload: () => ({ code: "", language: "" }),
};
