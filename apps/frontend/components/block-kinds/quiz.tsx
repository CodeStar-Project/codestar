import { useTranslations } from "next-intl";

import { GlassInput, GlassSelect, GlassTextarea } from "@/components/ui/glass-input";

import { QuizPlayer } from "./quiz-player";
import type { BlockKindModule, BlockPayload } from "./types";
import { getNum, getStr, getStrArray } from "./utils";

/** Parse the editor-local raw textarea (one option per line) into a clean list. */
function parseOptions(payload: BlockPayload): string[] {
  const raw = payload["_optionsRaw"];
  if (typeof raw === "string") {
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return getStrArray(payload, "options");
}

export const QuizModule: BlockKindModule = {
  Render({ block, id }) {
    const correctIndex = getNum(block.payload, "correctIndex");
    const explanation = getStr(block.payload, "explanation");
    return (
      <QuizPlayer
        id={id}
        question={getStr(block.payload, "question")}
        options={getStrArray(block.payload, "options")}
        correctIndex={correctIndex}
        explanation={explanation || undefined}
      />
    );
  },
  Edit({ payload, onPatch }) {
    const t = useTranslations("courseBuilder");
    const raw =
      (payload["_optionsRaw"] as string | undefined) ??
      getStrArray(payload, "options").join("\n");
    const options = parseOptions({ ...payload, _optionsRaw: raw });
    const correctIndex = getNum(payload, "correctIndex");

    return (
      <div className="space-y-2">
        <GlassInput
          value={getStr(payload, "question")}
          onChange={(e) => onPatch({ question: e.target.value })}
          placeholder={t("field.question")}
          aria-label={t("field.question")}
        />
        <GlassTextarea
          rows={4}
          value={raw}
          onChange={(e) => onPatch({ _optionsRaw: e.target.value })}
          placeholder={t("field.options")}
          aria-label={t("field.options")}
        />
        <p className="text-[0.78rem] text-muted">{t("field.optionsHelper")}</p>

        <label className="block text-[0.8rem] font-medium text-text-soft">
          {t("field.correctAnswer")}
        </label>
        <GlassSelect
          value={correctIndex ?? ""}
          onChange={(e) =>
            onPatch({ correctIndex: e.target.value === "" ? null : Number(e.target.value) })
          }
          aria-label={t("field.correctAnswer")}
        >
          <option value="">{t("field.correctAnswerNone")}</option>
          {options.map((opt, i) => (
            <option key={i} value={i}>
              {i + 1}. {opt.slice(0, 60)}
            </option>
          ))}
        </GlassSelect>

        <GlassTextarea
          rows={2}
          value={getStr(payload, "explanation")}
          onChange={(e) => onPatch({ explanation: e.target.value })}
          placeholder={t("field.explanation")}
          aria-label={t("field.explanation")}
        />
      </div>
    );
  },
  defaultPayload: () => ({
    question: "",
    options: [],
    _optionsRaw: "",
    correctIndex: null,
    explanation: "",
  }),
  normalize(payload) {
    const options = parseOptions(payload);
    const ci = getNum(payload, "correctIndex");
    const out: BlockPayload = {
      question: getStr(payload, "question"),
      options,
      // backend requires a valid in-range index; clamp/default to 0 when unset.
      correctIndex: ci !== null && ci >= 0 && ci < options.length ? ci : 0,
    };
    const explanation = getStr(payload, "explanation").trim();
    if (explanation) out.explanation = explanation;
    return out;
  },
};
