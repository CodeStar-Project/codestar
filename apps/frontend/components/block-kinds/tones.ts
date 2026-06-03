import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  LeafIcon,
  LightbulbIcon,
} from "@/components/ui/icons";
import type { CalloutTone } from "@/lib/types";

interface ToneSpec {
  /** CSS color used for the accent/border/icon (a theme token var). */
  color: string;
  icon: typeof InfoIcon;
  /** i18n key under `courseBuilder.tone`. */
  labelKey: string;
  /** Emoji surfaced in the insertion palette. */
  emoji: string;
}

export const TONES: Record<CalloutTone, ToneSpec> = {
  neutral: { color: "var(--color-accent)", icon: InfoIcon, labelKey: "neutral", emoji: "📝" },
  warning: { color: "var(--color-warning)", icon: AlertTriangleIcon, labelKey: "warning", emoji: "⚠️" },
  danger: { color: "var(--color-danger)", icon: AlertCircleIcon, labelKey: "danger", emoji: "⛔" },
  success: { color: "var(--color-success)", icon: CheckCircleIcon, labelKey: "success", emoji: "✅" },
  green: { color: "var(--color-green)", icon: LeafIcon, labelKey: "green", emoji: "🌱" },
  tip: { color: "var(--color-tip)", icon: LightbulbIcon, labelKey: "tip", emoji: "💡" },
};

export const TONE_ORDER: CalloutTone[] = [
  "neutral",
  "warning",
  "danger",
  "success",
  "green",
  "tip",
];

export function toneSpec(tone: string): ToneSpec {
  return TONES[(tone as CalloutTone)] ?? TONES.neutral;
}
