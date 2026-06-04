"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { updateSettings } from "@/app/actions/settings";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassField, GlassInput } from "@/components/ui/glass-input";

const MIN = 1;
const MAX = 1000;

export function SettingsForm({
  initialMaxBlocksPerPage,
}: {
  initialMaxBlocksPerPage: number;
}) {
  const t = useTranslations("adminSettings");
  const tErr = useTranslations("errors");
  const [value, setValue] = useState(String(initialMaxBlocksPerPage));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    const n = Number(value);
    if (!Number.isInteger(n) || n < MIN || n > MAX) {
      setError(t("maxBlocksRange", { min: MIN, max: MAX }));
      return;
    }
    start(async () => {
      const r = await updateSettings({ maxBlocksPerPage: n });
      if (!r.ok) {
        setError(r.error ?? tErr("unknown"));
        return;
      }
      if (r.data) setValue(String(r.data.maxBlocksPerPage));
      setSaved(true);
    });
  }

  return (
    <div className="max-w-md space-y-4">
      <GlassField
        label={t("maxBlocksLabel")}
        htmlFor="maxBlocksPerPage"
        helper={t("maxBlocksHelper", { min: MIN, max: MAX })}
        error={error ?? undefined}
      >
        <GlassInput
          id="maxBlocksPerPage"
          type="number"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          aria-invalid={error ? true : undefined}
        />
      </GlassField>

      <div className="flex items-center gap-3">
        <GlassButton type="button" variant="primary" onClick={save} loading={pending}>
          {t("save")}
        </GlassButton>
        {saved && (
          <span className="text-[0.85rem] text-[color:var(--color-success)]" role="status">
            {t("saved")}
          </span>
        )}
      </div>
    </div>
  );
}
