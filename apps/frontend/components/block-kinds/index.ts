import type { CourseBlockKind } from "@/lib/types";

import { CalloutModule } from "./callout";
import { CodeModule } from "./code";
import { H1Module, H2Module, H3Module } from "./heading";
import { ImageModule } from "./image";
import { AudioModule, VideoModule } from "./media";
import { ParagraphModule } from "./paragraph";
import { QuizModule } from "./quiz";
import type { BlockKindModule, BlockRegistry } from "./types";
import { stripPrivateKeys } from "./utils";

export const BLOCK_REGISTRY: BlockRegistry = {
  H1: H1Module,
  H2: H2Module,
  H3: H3Module,
  P: ParagraphModule,
  CODE: CodeModule,
  CALLOUT: CalloutModule,
  IMAGE: ImageModule,
  AUDIO: AudioModule,
  VIDEO: VideoModule,
  QUIZ: QuizModule,
};

export const SUPPORTED_KINDS = Object.keys(BLOCK_REGISTRY) as CourseBlockKind[];

export function getModule(kind: CourseBlockKind): BlockKindModule | null {
  return BLOCK_REGISTRY[kind] ?? null;
}

export function defaultPayloadFor(kind: CourseBlockKind): Record<string, unknown> {
  return BLOCK_REGISTRY[kind]?.defaultPayload?.() ?? {};
}

export function normalizePayload(
  kind: CourseBlockKind,
  payload: Record<string, unknown>
): Record<string, unknown> {
  const mod = BLOCK_REGISTRY[kind];
  if (mod?.normalize) return mod.normalize(payload);
  return stripPrivateKeys(payload);
}

export type {
  BlockEditLabels,
  BlockEditProps,
  BlockKindModule,
  BlockPayload,
  BlockRegistry,
  BlockRenderProps,
} from "./types";
