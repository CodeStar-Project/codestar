import {
  CodeIcon,
  HelpCircleIcon,
  ImageIcon,
  QuoteIcon,
  TableIcon,
  TerminalIcon,
  TypeIcon,
} from "@/components/ui/icons";
import type { CourseBlockKind } from "@/lib/types";

import { TONE_ORDER, toneSpec } from "./tones";
import type { BlockPayload } from "./types";

export type PaletteGroup = "text" | "highlight" | "media" | "interactive";

export const PALETTE_GROUPS: PaletteGroup[] = [
  "text",
  "highlight",
  "media",
  "interactive",
];

export interface PaletteEntry {
  /** Stable id (unique across tone variants of CALLOUT). */
  id: string;
  kind: CourseBlockKind;
  group: PaletteGroup;
  icon: (props: { size?: number }) => React.ReactElement;
  /** i18n key relative to the `courseBuilder` namespace. */
  labelKey: string;
  /** Merged onto the kind's defaultPayload (used to preset CALLOUT tone). */
  payloadPatch?: BlockPayload;
}

const calloutEntries: PaletteEntry[] = TONE_ORDER.map((tone) => ({
  id: `CALLOUT:${tone}`,
  kind: "CALLOUT" as const,
  group: "highlight" as const,
  icon: toneSpec(tone).icon,
  labelKey: `tone.${toneSpec(tone).labelKey}`,
  payloadPatch: { tone },
}));

export const PALETTE: PaletteEntry[] = [
  { id: "H1", kind: "H1", group: "text", icon: TypeIcon, labelKey: "palette.h1" },
  { id: "H2", kind: "H2", group: "text", icon: TypeIcon, labelKey: "palette.h2" },
  { id: "H3", kind: "H3", group: "text", icon: TypeIcon, labelKey: "palette.h3" },
  { id: "H4", kind: "H4", group: "text", icon: TypeIcon, labelKey: "palette.h4" },
  { id: "H5", kind: "H5", group: "text", icon: TypeIcon, labelKey: "palette.h5" },
  { id: "H6", kind: "H6", group: "text", icon: TypeIcon, labelKey: "palette.h6" },
  { id: "P", kind: "P", group: "text", icon: TypeIcon, labelKey: "palette.p" },
  { id: "QUOTE", kind: "QUOTE", group: "text", icon: QuoteIcon, labelKey: "palette.quote" },
  { id: "CODE", kind: "CODE", group: "text", icon: CodeIcon, labelKey: "palette.code" },
  ...calloutEntries,
  { id: "IMAGE", kind: "IMAGE", group: "media", icon: ImageIcon, labelKey: "palette.image" },
  { id: "TABLE", kind: "TABLE", group: "media", icon: TableIcon, labelKey: "palette.table" },
  { id: "QUIZ", kind: "QUIZ", group: "interactive", icon: HelpCircleIcon, labelKey: "palette.quiz" },
  { id: "SANDBOX", kind: "SANDBOX", group: "interactive", icon: TerminalIcon, labelKey: "palette.sandbox" },
];

export function paletteByGroup(group: PaletteGroup): PaletteEntry[] {
  return PALETTE.filter((e) => e.group === group);
}
