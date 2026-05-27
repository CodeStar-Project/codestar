import { GlassInput } from "@/components/ui/glass-input";

import type { BlockKindModule } from "./types";
import { getStr, safeUrl } from "./utils";

function makeMedia(tag: "audio" | "video"): BlockKindModule {
  return {
    Render({ block, id }) {
      const src = safeUrl(getStr(block.payload, "src"));
      if (!src) {
        return (
          <div
            id={id}
            className="my-6 aspect-video rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)]"
          />
        );
      }
      return (
        <div id={id} className="my-6">
          {tag === "audio" ? (
            <audio controls src={src} className="w-full" />
          ) : (
            <video controls src={src} className="w-full rounded-[var(--r-lg)]" />
          )}
        </div>
      );
    },
    Edit({ payload, labels, onPatch }) {
      return (
        <GlassInput
          type="url"
          value={getStr(payload, "src")}
          onChange={(e) => onPatch({ src: e.target.value })}
          placeholder={labels.fieldSrc}
          aria-label={labels.fieldSrc}
        />
      );
    },
    defaultPayload: () => ({ src: "" }),
  };
}

export const AudioModule = makeMedia("audio");
export const VideoModule = makeMedia("video");
