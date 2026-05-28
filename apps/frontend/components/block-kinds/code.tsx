import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

export const CodeModule: BlockKindModule = {
  Render({ block, id }) {
    return (
      <pre
        id={id}
        className="my-6 overflow-x-auto rounded-[var(--r)] border border-[color:var(--glass-border)] bg-[color:color-mix(in_oklab,var(--text)_92%,transparent)] p-4 font-mono text-[0.85rem] leading-relaxed text-white"
      >
        <code>{getStr(block.payload, "code")}</code>
      </pre>
    );
  },
  Edit({ payload, labels, onPatch }) {
    return (
      <div className="space-y-2">
        <GlassInput
          value={getStr(payload, "language")}
          onChange={(e) => onPatch({ language: e.target.value })}
          placeholder={labels.fieldLanguage}
          aria-label={labels.fieldLanguage}
        />
        <GlassTextarea
          rows={6}
          value={getStr(payload, "code")}
          onChange={(e) => onPatch({ code: e.target.value })}
          placeholder={labels.fieldCode}
          aria-label={labels.fieldCode}
          className="font-mono text-[0.85rem]"
        />
      </div>
    );
  },
  defaultPayload: () => ({ code: "", language: "" }),
};
