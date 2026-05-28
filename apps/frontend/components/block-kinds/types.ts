import type { CourseBlock, CourseBlockKind } from "@/lib/types";

export type BlockPayload = Record<string, unknown>;

export interface BlockEditLabels {
  fieldText: string;
  fieldCode: string;
  fieldLanguage: string;
  fieldSrc: string;
  fieldAlt: string;
  fieldTone: string;
  fieldQuestion: string;
  fieldOptions: string;
  fieldOptionsHelper: string;
  toneNeutral: string;
  toneWarning: string;
  toneDanger: string;
}

export interface BlockRenderProps {
  block: CourseBlock;
  id?: string;
}

export interface BlockEditProps {
  payload: BlockPayload;
  labels: BlockEditLabels;
  onPatch: (patch: BlockPayload) => void;
}

export interface BlockKindModule {
  Render: (props: BlockRenderProps) => React.ReactElement | null;
  Edit: (props: BlockEditProps) => React.ReactElement | null;
  /** Initial payload when adding a new block of this kind. */
  defaultPayload?: () => BlockPayload;
  /** Convert editor-local state (e.g. raw textarea) to backend payload before save. */
  normalize?: (payload: BlockPayload) => BlockPayload;
}

export type BlockRegistry = Record<CourseBlockKind, BlockKindModule>;
