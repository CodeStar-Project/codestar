import { useTranslations } from "next-intl";

import { GlassInput, GlassTextarea } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr } from "./utils";

export const QuoteModule: BlockKindModule = {
  Render({ block, id }) {
    const text = getStr(block.payload, "text");
    const author = getStr(block.payload, "author");
    const source = getStr(block.payload, "source");
    return (
      <figure id={id} className="my-6">
        <blockquote className="border-l-2 border-[color:var(--color-accent)] pl-5 font-display text-[1.25rem] italic leading-relaxed text-text">
          {text}
        </blockquote>
        {(author || source) && (
          <figcaption className="mt-2 pl-5 text-[0.85rem] text-muted">
            {author && <span className="font-medium text-text-soft">{author}</span>}
            {author && source && " — "}
            {source && <cite className="not-italic">{source}</cite>}
          </figcaption>
        )}
      </figure>
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
          placeholder={t("field.quoteText")}
          aria-label={t("field.quoteText")}
        />
        <GlassInput
          value={getStr(payload, "author")}
          onChange={(e) => onPatch({ author: e.target.value })}
          placeholder={t("field.author")}
          aria-label={t("field.author")}
        />
        <GlassInput
          value={getStr(payload, "source")}
          onChange={(e) => onPatch({ source: e.target.value })}
          placeholder={t("field.source")}
          aria-label={t("field.source")}
        />
      </div>
    );
  },
  defaultPayload: () => ({ text: "", author: "", source: "" }),
  normalize(payload) {
    const out: Record<string, unknown> = { text: getStr(payload, "text") };
    const author = getStr(payload, "author").trim();
    const source = getStr(payload, "source").trim();
    if (author) out.author = author;
    if (source) out.source = source;
    return out;
  },
};
