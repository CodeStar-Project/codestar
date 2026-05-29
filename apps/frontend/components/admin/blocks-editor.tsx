"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveCourseBlocks } from "@/app/actions/courses";
import {
  defaultPayloadFor,
  getModule,
  normalizePayload,
  SUPPORTED_KINDS,
  type BlockEditLabels,
  type BlockPayload,
} from "@/components/block-kinds";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GlassSelect } from "@/components/ui/glass-input";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { BlockInput, CourseBlock, CourseBlockKind } from "@/lib/types";

interface Labels extends BlockEditLabels {
  addBlock: string;
  kind: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  save: string;
  cancel: string;
  saved: string;
  empty: string;
  emptyError: string;
  errorUnknown: string;
}

interface BlocksEditorProps {
  courseId: string;
  initialBlocks: CourseBlock[];
  labels: Labels;
  cancelHref: string;
}

interface DraftBlock {
  localId: string;
  kind: CourseBlockKind;
  payload: BlockPayload;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `d${counter}-${Date.now()}`;
}

function toDraft(b: CourseBlock): DraftBlock {
  return { localId: b.id, kind: b.kind, payload: { ...b.payload } };
}

function emptyDraft(kind: CourseBlockKind): DraftBlock {
  return { localId: nextId(), kind, payload: defaultPayloadFor(kind) };
}

export function BlocksEditor({
  courseId,
  initialBlocks,
  labels,
  cancelHref,
}: BlocksEditorProps) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<DraftBlock[]>(() =>
    initialBlocks.map(toDraft)
  );
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, start] = useTransition();

  function patchBlock(localId: string, patch: BlockPayload) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.localId === localId ? { ...b, payload: { ...b.payload, ...patch } } : b
      )
    );
  }

  function changeKind(localId: string, kind: CourseBlockKind) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.localId === localId
          ? { ...b, kind, payload: defaultPayloadFor(kind) }
          : b
      )
    );
  }

  function move(localId: string, delta: number) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.localId === localId);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function remove(localId: string) {
    setBlocks((prev) => prev.filter((b) => b.localId !== localId));
  }

  function add(kind: CourseBlockKind) {
    setBlocks((prev) => [...prev, emptyDraft(kind)]);
  }

  function save() {
    setError(null);
    if (blocks.length === 0) {
      setError(labels.emptyError);
      return;
    }
    const payload: BlockInput[] = blocks.map((b) => ({
      kind: b.kind,
      payload: normalizePayload(b.kind, b.payload),
    }));
    start(async () => {
      const r = await saveCourseBlocks(courseId, payload);
      if (!r.ok) {
        setError(r.error ?? labels.errorUnknown);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[0.85rem] text-text-soft">
          <span className="font-mono">{blocks.length}</span>{" "}
          {blocks.length === 1 ? "bloc" : "blocs"}
          {savedAt && (
            <span className="ml-3 text-[color:var(--color-success)]">
              ✓ {labels.saved}
            </span>
          )}
          {error && (
            <span className="ml-3 text-[color:var(--color-danger)]">
              {error}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => router.push(cancelHref)}
          >
            {labels.cancel}
          </GlassButton>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={save}
            disabled={pending}
          >
            {labels.save}
          </GlassButton>
        </div>
      </div>

      {blocks.length === 0 ? (
        <GlassCard variant="plain" className="p-10 text-center text-text-soft">
          {labels.empty}
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {blocks.map((b, idx) => (
            <li key={b.localId}>
              <BlockRow
                block={b}
                index={idx}
                total={blocks.length}
                labels={labels}
                onChangeKind={(k) => changeKind(b.localId, k)}
                onPatch={(p) => patchBlock(b.localId, p)}
                onMove={(d) => move(b.localId, d)}
                onRemove={() => remove(b.localId)}
              />
            </li>
          ))}
        </ul>
      )}

      <AddBar onAdd={add} label={labels.addBlock} kindLabel={labels.kind} />
    </div>
  );
}

function BlockRow({
  block,
  index,
  total,
  labels,
  onChangeKind,
  onPatch,
  onMove,
  onRemove,
}: {
  block: DraftBlock;
  index: number;
  total: number;
  labels: Labels;
  onChangeKind: (k: CourseBlockKind) => void;
  onPatch: (p: BlockPayload) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const mod = getModule(block.kind);
  const Edit = mod?.Edit;

  return (
    <GlassCard variant="default">
      <GlassCardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
            #{index + 1}
          </span>
          <GlassSelect
            value={block.kind}
            onChange={(e) => onChangeKind(e.target.value as CourseBlockKind)}
            className="w-32"
            aria-label={labels.kind}
          >
            {SUPPORTED_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </GlassSelect>
          <span className="flex-1" />
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={labels.moveUp}
          >
            <ChevronLeftIcon size={14} className="rotate-90" />
          </GlassButton>
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={labels.moveDown}
          >
            <ChevronRightIcon size={14} className="rotate-90" />
          </GlassButton>
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            aria-label={labels.remove}
            className="text-[color:var(--color-danger)]"
          >
            <TrashIcon size={14} />
          </GlassButton>
        </div>
        {Edit && (
          <Edit payload={block.payload} labels={labels} onPatch={onPatch} />
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

function AddBar({
  onAdd,
  label,
  kindLabel,
}: {
  onAdd: (k: CourseBlockKind) => void;
  label: string;
  kindLabel: string;
}) {
  const [kind, setKind] = useState<CourseBlockKind>("P");
  return (
    <div className="flex items-center gap-2 rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-3">
      <GlassSelect
        value={kind}
        onChange={(e) => setKind(e.target.value as CourseBlockKind)}
        className="w-32"
        aria-label={kindLabel}
      >
        {SUPPORTED_KINDS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </GlassSelect>
      <GlassButton
        type="button"
        variant="glass"
        size="sm"
        onClick={() => onAdd(kind)}
      >
        <PlusIcon size={14} />
        {label}
      </GlassButton>
    </div>
  );
}
