import { useTranslations } from "next-intl";

import { GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

export const ParagraphModule: BlockKindModule = {
  Render({ block, id }) {
    return (
      <p id={id} className="my-4 text-[1rem] leading-[1.75] text-text-soft">
        {getStr(block.payload, "text")}
      </p>
    );
  },
  Edit({ payload, onPatch }) {
    const t = useTranslations("courseBuilder");
    return (
      <GlassTextarea
        rows={4}
        value={getStr(payload, "text")}
        onChange={(e) => onPatch({ text: e.target.value })}
        placeholder={t("field.text")}
        aria-label={t("field.text")}
      />
    );
  },
  defaultPayload: () => ({ text: "" }),
};
