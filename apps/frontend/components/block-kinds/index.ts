import type { CourseBlockKind } from "@/lib/types";

import { CalloutModule } from "./callout";
import { CodeModule } from "./code";
import {
  H1Module,
  H2Module,
  H3Module,
  H4Module,
  H5Module,
  H6Module,
} from "./heading";
import { ImageModule } from "./image";
import { ParagraphModule } from "./paragraph";
import { QuizModule } from "./quiz";
import { QuoteModule } from "./quote";
import { SandboxModule } from "./sandbox";
import { TableModule } from "./table";
import type { BlockKindModule, BlockRegistry } from "./types";
import { stripPrivateKeys } from "./utils";

export const BLOCK_REGISTRY: BlockRegistry = {
  H1: H1Module,
  H2: H2Module,
  H3: H3Module,
  H4: H4Module,
  H5: H5Module,
  H6: H6Module,
  P: ParagraphModule,
  CODE: CodeModule,
  CALLOUT: CalloutModule,
  QUOTE: QuoteModule,
  IMAGE: ImageModule,
  TABLE: TableModule,
  QUIZ: QuizModule,
  SANDBOX: SandboxModule,
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
  BlockEditProps,
  BlockKindModule,
  BlockPayload,
  BlockRegistry,
  BlockRenderProps,
} from "./types";
