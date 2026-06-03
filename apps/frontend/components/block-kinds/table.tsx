import { useTranslations } from "next-intl";

import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";

import type { BlockKindModule, BlockPayload } from "./types";
import { getMatrix, getStrArray } from "./utils";

const MAX_COLS = 12;
const MAX_ROWS = 100;

/** Reshape rows to exactly `cols` columns (pad/truncate) — keeps payload rectangular. */
function rectangular(rows: string[][], cols: number): string[][] {
  return rows.map((row) => {
    const next = row.slice(0, cols);
    while (next.length < cols) next.push("");
    return next;
  });
}

export const TableModule: BlockKindModule = {
  Render({ block, id }) {
    const header = getStrArray(block.payload, "header");
    const rows = getMatrix(block.payload, "rows");
    if (header.length === 0) return null;
    return (
      <div id={id} className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-[0.9rem]">
          <thead>
            <tr>
              {header.map((h, i) => (
                <th
                  key={i}
                  className="border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] px-3 py-2 text-left font-medium text-text"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className="border border-[color:var(--glass-border)] px-3 py-2 text-text-soft"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
  Edit({ payload, onPatch }) {
    const t = useTranslations("courseBuilder");
    const header = getStrArray(payload, "header");
    const cols = header.length || 1;
    const rows = rectangular(getMatrix(payload, "rows"), cols);

    const commit = (h: string[], r: string[][]) =>
      onPatch({ header: h, rows: rectangular(r, h.length) });

    const setHeader = (i: number, v: string) => {
      const h = [...header];
      h[i] = v;
      commit(h, rows);
    };
    const setCell = (r: number, c: number, v: string) => {
      const next = rows.map((row) => [...row]);
      next[r][c] = v;
      commit(header, next);
    };
    const addColumn = () => {
      if (cols >= MAX_COLS) return;
      commit([...header, ""], rows.map((row) => [...row, ""]));
    };
    const removeColumn = (i: number) => {
      if (cols <= 1) return;
      commit(
        header.filter((_, idx) => idx !== i),
        rows.map((row) => row.filter((_, idx) => idx !== i))
      );
    };
    const addRow = () => {
      if (rows.length >= MAX_ROWS) return;
      commit(header, [...rows, Array(cols).fill("")]);
    };
    const removeRow = (r: number) =>
      commit(header, rows.filter((_, idx) => idx !== r));

    return (
      <div className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {header.map((h, i) => (
                  <th key={i} className="p-1 align-top">
                    <GlassInput
                      size="sm"
                      value={h}
                      onChange={(e) => setHeader(i, e.target.value)}
                      placeholder={`${t("field.tableHeader")} ${i + 1}`}
                      aria-label={`${t("field.tableHeader")} ${i + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(i)}
                      disabled={cols <= 1}
                      aria-label={t("field.removeColumn")}
                      className="mt-1 w-full text-[0.7rem] text-muted hover:text-[color:var(--color-danger)] disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </th>
                ))}
                <th className="p-1 align-top">
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addColumn}
                    disabled={cols >= MAX_COLS}
                    aria-label={t("field.addColumn")}
                  >
                    <PlusIcon size={14} />
                  </GlassButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="p-1">
                      <GlassInput
                        size="sm"
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        aria-label={`${t("field.tableCell")} ${r + 1}.${c + 1}`}
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center">
                    <GlassButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(r)}
                      aria-label={t("field.removeRow")}
                      className="text-[color:var(--color-danger)]"
                    >
                      <TrashIcon size={14} />
                    </GlassButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <GlassButton type="button" variant="glass" size="sm" onClick={addRow} disabled={rows.length >= MAX_ROWS}>
          <PlusIcon size={14} />
          {t("field.addRow")}
        </GlassButton>
      </div>
    );
  },
  defaultPayload: (): BlockPayload => ({
    header: ["", ""],
    rows: [
      ["", ""],
      ["", ""],
    ],
  }),
  normalize(payload) {
    const header = getStrArray(payload, "header");
    const cols = header.length || 1;
    return { header, rows: rectangular(getMatrix(payload, "rows"), cols) };
  },
};
