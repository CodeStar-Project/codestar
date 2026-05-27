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
  Edit({ payload, labels, onPatch }) {
    return (
      <GlassTextarea
        rows={3}
        value={getStr(payload, "text")}
        onChange={(e) => onPatch({ text: e.target.value })}
        placeholder={labels.fieldText}
        aria-label={labels.fieldText}
      />
    );
  },
  defaultPayload: () => ({ text: "" }),
};
