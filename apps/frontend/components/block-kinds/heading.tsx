import { useTranslations } from "next-intl";

import { GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

const CLASSES = {
  H1: "font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight text-text mt-12 mb-4 scroll-mt-24",
  H2: "font-display text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-text mt-10 mb-3 scroll-mt-24",
  H3: "font-display text-[1.2rem] text-text mt-8 mb-2 scroll-mt-24",
  H4: "font-display text-[1.05rem] font-medium text-text mt-6 mb-2 scroll-mt-24",
  H5: "font-sans text-[0.95rem] font-semibold uppercase tracking-[0.04em] text-text-soft mt-5 mb-1.5 scroll-mt-24",
  H6: "font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-muted mt-4 mb-1.5 scroll-mt-24",
} as const;

type Level = keyof typeof CLASSES;

const TAGS: Record<Level, "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> = {
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
};

function makeHeading(level: Level): BlockKindModule {
  const Tag = TAGS[level];
  return {
    Render({ block, id }) {
      return (
        <Tag id={id} className={CLASSES[level]}>
          {getStr(block.payload, "text")}
        </Tag>
      );
    },
    Edit({ payload, onPatch }) {
      const t = useTranslations("courseBuilder");
      return (
        <GlassTextarea
          rows={1}
          value={getStr(payload, "text")}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder={t("field.text")}
          aria-label={t("field.text")}
        />
      );
    },
    defaultPayload: () => ({ text: "" }),
  };
}

export const H1Module = makeHeading("H1");
export const H2Module = makeHeading("H2");
export const H3Module = makeHeading("H3");
export const H4Module = makeHeading("H4");
export const H5Module = makeHeading("H5");
export const H6Module = makeHeading("H6");
