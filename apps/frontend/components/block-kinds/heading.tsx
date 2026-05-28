import { GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

const CLASSES = {
  H1: "font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight text-text mt-12 mb-4 scroll-mt-24",
  H2: "font-display text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-text mt-10 mb-3 scroll-mt-24",
  H3: "font-display text-[1.2rem] text-text mt-8 mb-2 scroll-mt-24",
} as const;

type Level = keyof typeof CLASSES;

function makeHeading(level: Level): BlockKindModule {
  const Tag = level === "H1" ? "h1" : level === "H2" ? "h2" : "h3";
  return {
    Render({ block, id }) {
      return (
        <Tag id={id} className={CLASSES[level]}>
          {getStr(block.payload, "text")}
        </Tag>
      );
    },
    Edit({ payload, labels, onPatch }) {
      return (
        <GlassTextarea
          rows={1}
          value={getStr(payload, "text")}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder={labels.fieldText}
          aria-label={labels.fieldText}
        />
      );
    },
    defaultPayload: () => ({ text: "" }),
  };
}

export const H1Module = makeHeading("H1");
export const H2Module = makeHeading("H2");
export const H3Module = makeHeading("H3");
