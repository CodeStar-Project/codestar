import { useTranslations } from "next-intl";

import { GlassInput } from "@/components/ui/glass-input";

import { ImageUploader } from "./image-uploader";
import type { BlockKindModule } from "./types";
import { getStr, safeUrl } from "./utils";

export const ImageModule: BlockKindModule = {
  Render({ block, id }) {
    const src = safeUrl(getStr(block.payload, "src"));
    const alt = getStr(block.payload, "alt");
    return (
      <figure id={id} className="my-6">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[var(--r-lg)] border border-[color:var(--glass-border)]"
          />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)] text-muted">
            Image
          </div>
        )}
        {alt && (
          <figcaption className="mt-2 text-center text-[0.82rem] text-muted">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
  Edit({ payload, onPatch }) {
    const t = useTranslations("courseBuilder");
    const preview = safeUrl(getStr(payload, "src"));
    return (
      <div className="space-y-2">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="max-h-40 w-full rounded-[var(--r)] border border-[color:var(--glass-border)] object-contain"
          />
        )}

        <ImageUploader
          onUploaded={(url) => onPatch({ src: url })}
          label={t("field.imageUpload")}
          errorLabel={t("field.imageUploadError")}
        />

        <GlassInput
          type="url"
          value={getStr(payload, "src")}
          onChange={(e) => onPatch({ src: e.target.value })}
          placeholder={t("field.src")}
          aria-label={t("field.src")}
        />
        <GlassInput
          value={getStr(payload, "alt")}
          onChange={(e) => onPatch({ alt: e.target.value })}
          placeholder={t("field.alt")}
          aria-label={t("field.alt")}
        />
      </div>
    );
  },
  defaultPayload: () => ({ src: "", alt: "" }),
};
