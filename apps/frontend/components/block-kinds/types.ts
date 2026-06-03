import type { CourseBlock, CourseBlockKind } from "@/lib/types";

export type BlockPayload = Record<string, unknown>;

export interface BlockRenderProps {
  block: CourseBlock;
  id?: string;
}

export interface BlockEditProps {
  payload: BlockPayload;
  onPatch: (patch: BlockPayload) => void;
}

export interface BlockKindModule {
  Render: (props: BlockRenderProps) => React.ReactElement | null;
  /** Inspector form. Client-only — may use `useTranslations`. */
  Edit: (props: BlockEditProps) => React.ReactElement | null;
  /** Initial payload when adding a new block of this kind. */
  defaultPayload?: () => BlockPayload;
  /** Convert editor-local state (e.g. raw textarea) to backend payload before save. */
  normalize?: (payload: BlockPayload) => BlockPayload;
}

export type BlockRegistry = Record<CourseBlockKind, BlockKindModule>;
