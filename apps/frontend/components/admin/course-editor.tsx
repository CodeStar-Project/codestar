"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  changeCourseStatus,
  exportCourse,
  importCourse,
  saveCoursePages,
  updateCourse,
} from "@/app/actions/courses";
import {
  defaultPayloadFor,
  getModule,
  normalizePayload,
  type BlockPayload,
} from "@/components/block-kinds";
import {
  PALETTE_GROUPS,
  paletteByGroup,
  type PaletteEntry,
} from "@/components/block-kinds/palette";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput, GlassSelect } from "@/components/ui/glass-input";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  GripVerticalIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/ui/icons";
import type {
  CourseBlock,
  CourseBlockKind,
  CourseExport,
  CoursePage,
  CourseStatus,
  PageInput,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface DraftBlock {
  localId: string;
  kind: CourseBlockKind;
  payload: BlockPayload;
}

interface DraftPage {
  localId: string;
  title: string;
  blocks: DraftBlock[];
}

interface CourseEditorProps {
  courseId: string;
  courseSlug: string;
  initialTitle: string;
  initialStatus: CourseStatus;
  initialPages: CoursePage[];
  maxBlocksPerPage: number;
  previewHref: string;
}

type View = "edit" | "split" | "preview";
const STATUSES: CourseStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const AUTOSAVE_MS = 1500;

let counter = 0;
function nextId(): string {
  counter += 1;
  return `d${counter}-${Date.now()}`;
}

function toDraftPage(p: CoursePage): DraftPage {
  return {
    localId: p.id,
    title: p.title ?? "",
    blocks: p.blocks.map((b) => ({ localId: b.id, kind: b.kind, payload: { ...b.payload } })),
  };
}

function emptyPage(): DraftPage {
  return { localId: nextId(), title: "", blocks: [] };
}

function toRenderBlock(d: DraftBlock): CourseBlock {
  return {
    id: d.localId,
    kind: d.kind,
    orderIndex: 0,
    payload: normalizePayload(d.kind, d.payload),
  };
}

function previewText(d: DraftBlock): string {
  const p = d.payload;
  const candidates = [p.text, p.question, p.code, p.src];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  if (Array.isArray(p.header)) return (p.header as unknown[]).filter(Boolean).join(" · ");
  return "";
}

function countWords(pages: DraftPage[]): number {
  let n = 0;
  const eat = (s: unknown) => {
    if (typeof s === "string") n += s.trim().split(/\s+/).filter(Boolean).length;
    else if (Array.isArray(s)) s.forEach(eat);
  };
  for (const page of pages) {
    for (const b of page.blocks) {
      const p = b.payload;
      eat(p.text);
      eat(p.question);
      eat(p.options);
      eat(p.code);
      eat(p.header);
      eat(p.rows);
      eat(p.author);
      eat(p.source);
      eat(p.expectedOutput);
    }
  }
  return n;
}

export function CourseEditor({
  courseId,
  courseSlug,
  initialTitle,
  initialStatus,
  initialPages,
  maxBlocksPerPage,
  previewHref,
}: CourseEditorProps) {
  const t = useTranslations("courseBuilder");
  const tErr = useTranslations("errors");
  const router = useRouter();

  const [pages, setPages] = useState<DraftPage[]>(() =>
    initialPages.length > 0 ? initialPages.map(toDraftPage) : [emptyPage()]
  );
  const [currentPageId, setCurrentPageId] = useState<string>(
    () => (initialPages[0]?.id ?? null) ?? ""
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<CourseStatus>(initialStatus);
  const [view, setView] = useState<View>("edit");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startMeta] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSavedJson = useRef<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const currentPage =
    pages.find((p) => p.localId === currentPageId) ?? pages[0];
  const currentBlocks = useMemo(() => currentPage?.blocks ?? [], [currentPage]);
  const selected = currentBlocks.find((b) => b.localId === selectedId) ?? null;
  const pageFull = currentBlocks.length >= maxBlocksPerPage;

  const markDirty = () => {
    setDirty(true);
    setError(null);
  };

  // ---- page ops ----
  function updateCurrentPage(fn: (p: DraftPage) => DraftPage) {
    setPages((prev) =>
      prev.map((p) => (p.localId === currentPage?.localId ? fn(p) : p))
    );
    markDirty();
  }

  function addPage() {
    const page = emptyPage();
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.localId === currentPage?.localId);
      const next = [...prev];
      next.splice(idx + 1, 0, page);
      return next;
    });
    setCurrentPageId(page.localId);
    setSelectedId(null);
    markDirty();
  }

  function removePage(localId: string) {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((p) => p.localId === localId);
      const next = prev.filter((p) => p.localId !== localId);
      const fallback = next[Math.max(0, idx - 1)];
      setCurrentPageId(fallback.localId);
      setSelectedId(null);
      return next;
    });
    markDirty();
  }

  function movePage(localId: string, delta: number) {
    setPages((prev) => {
      const i = prev.findIndex((p) => p.localId === localId);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      return arrayMove(prev, i, j);
    });
    markDirty();
  }

  function renameCurrentPage(value: string) {
    updateCurrentPage((p) => ({ ...p, title: value }));
  }

  // ---- block ops (scoped to current page) ----
  function patchBlock(localId: string, patch: BlockPayload) {
    updateCurrentPage((p) => ({
      ...p,
      blocks: p.blocks.map((b) =>
        b.localId === localId ? { ...b, payload: { ...b.payload, ...patch } } : b
      ),
    }));
  }

  function addEntry(entry: PaletteEntry) {
    if (pageFull) {
      setError(t("pages.full", { max: maxBlocksPerPage }));
      return;
    }
    const draft: DraftBlock = {
      localId: nextId(),
      kind: entry.kind,
      payload: { ...defaultPayloadFor(entry.kind), ...(entry.payloadPatch ?? {}) },
    };
    updateCurrentPage((p) => {
      const idx = p.blocks.findIndex((b) => b.localId === selectedId);
      const blocks = [...p.blocks];
      if (idx === -1) blocks.push(draft);
      else blocks.splice(idx + 1, 0, draft);
      return { ...p, blocks };
    });
    setSelectedId(draft.localId);
  }

  function removeBlock(localId: string) {
    updateCurrentPage((p) => ({
      ...p,
      blocks: p.blocks.filter((b) => b.localId !== localId),
    }));
    setSelectedId((cur) => (cur === localId ? null : cur));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    updateCurrentPage((p) => {
      const from = p.blocks.findIndex((b) => b.localId === active.id);
      const to = p.blocks.findIndex((b) => b.localId === over.id);
      if (from === -1 || to === -1) return p;
      return { ...p, blocks: arrayMove(p.blocks, from, to) };
    });
  }

  // ---- persistence ----
  const buildPayload = useCallback(
    (): PageInput[] =>
      pages.map((p) => ({
        title: p.title.trim() || null,
        blocks: p.blocks.map((b) => ({
          kind: b.kind,
          payload: normalizePayload(b.kind, b.payload),
        })),
      })),
    [pages]
  );

  const persist = useCallback(async (): Promise<boolean> => {
    const payload = buildPayload();
    const json = JSON.stringify(payload);
    if (json === lastSavedJson.current) {
      setDirty(false);
      return true;
    }
    setSaving(true);
    const r = await saveCoursePages(courseId, payload);
    setSaving(false);
    if (!r.ok) {
      setError(r.error ?? tErr("unknown"));
      return false;
    }
    lastSavedJson.current = json;
    setSavedAt(Date.now());
    setDirty(false);
    return true;
  }, [buildPayload, courseId, tErr]);

  useEffect(() => {
    if (!dirty) return;
    const id = setTimeout(() => void persist(), AUTOSAVE_MS);
    return () => clearTimeout(id);
  }, [dirty, persist]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function saveTitle() {
    if (title.trim() === initialTitle || !title.trim()) return;
    startMeta(async () => {
      await updateCourse(courseId, { title: title.trim() });
    });
  }

  function onStatusChange(next: CourseStatus) {
    const prev = status;
    setStatus(next);
    startMeta(async () => {
      const r = await changeCourseStatus(courseId, next);
      if (!r.ok) {
        setStatus(prev);
        setError(r.error ?? tErr("unknown"));
      }
    });
  }

  // ---- import / export ----
  async function onExport() {
    if (dirty) await persist();
    const r = await exportCourse(courseId);
    if (!r.ok || !r.data) {
      setError(r.error ?? tErr("unknown"));
      return;
    }
    const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${courseSlug || "course"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [importing, startImport] = useTransition();
  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    file
      .text()
      .then((text) => {
        let parsed: CourseExport;
        try {
          parsed = JSON.parse(text) as CourseExport;
        } catch {
          setError(t("import.invalidJson"));
          return;
        }
        if (!parsed?.course || !Array.isArray(parsed?.pages)) {
          setError(t("import.invalidShape"));
          return;
        }
        startImport(async () => {
          const r = await importCourse(parsed);
          if (!r.ok || !r.course) {
            setError(r.error ?? tErr("unknown"));
            return;
          }
          router.push(`/admin/courses/${r.course.id}/blocks`);
        });
      })
      .catch(() => setError(tErr("unknown")));
  }

  const renderBlocks = useMemo(() => currentBlocks.map(toRenderBlock), [currentBlocks]);
  const totalBlocks = useMemo(
    () => pages.reduce((acc, p) => acc + p.blocks.length, 0),
    [pages]
  );
  const words = useMemo(() => countWords(pages), [pages]);
  const minutes = Math.max(1, Math.ceil(words / 200));

  const showCanvas = view !== "preview";
  const showPreview = view !== "edit";

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr_320px]">
      {/* LEFT — palette */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-3 backdrop-blur-md">
          <h2 className="mb-2 px-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
            {t("paletteTitle")}
          </h2>
          {pageFull && (
            <p className="mb-2 px-1 text-[0.72rem] text-[color:var(--color-warning)]">
              {t("pages.full", { max: maxBlocksPerPage })}
            </p>
          )}
          <div className="space-y-3">
            {PALETTE_GROUPS.map((group) => (
              <div key={group}>
                <div className="mb-1 px-1 text-[0.72rem] font-medium text-muted">
                  {t(`group.${group}`)}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {paletteByGroup(group).map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        disabled={pageFull}
                        onClick={() => addEntry(entry)}
                        className="flex items-center gap-1.5 rounded-[var(--r)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] px-2 py-1.5 text-left text-[0.78rem] text-text-soft transition-colors hover:border-[color:var(--color-accent)] hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Icon size={14} />
                        <span className="truncate">
                          {t(entry.labelKey as Parameters<typeof t>[0])}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CENTER — toolbar + pages bar + canvas/preview */}
      <div className="min-w-0 space-y-4">
        <div className="sticky top-20 z-10 space-y-2 rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] p-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <GlassInput
              size="sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              aria-label={t("field.courseTitle")}
              className="min-w-[10rem] flex-1 font-display"
            />
            <GlassSelect
              size="sm"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as CourseStatus)}
              aria-label={t("statusLabel")}
              className="w-36"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </GlassSelect>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full border border-[color:var(--glass-border)] p-0.5">
              {(["edit", "split", "preview"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    "rounded-full px-3 py-1 text-[0.8rem] transition-colors",
                    view === v
                      ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                      : "text-text-soft hover:text-text"
                  )}
                >
                  {t(`view.${v}`)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-[0.78rem] text-muted" aria-live="polite">
                {saving ? t("saving") : dirty ? t("unsaved") : savedAt ? t("saved") : ""}
              </span>
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                loading={importing}
              >
                <UploadIcon size={14} /> {t("import.button")}
              </GlassButton>
              <GlassButton type="button" variant="ghost" size="sm" onClick={onExport}>
                <DownloadIcon size={14} /> {t("export.button")}
              </GlassButton>
              <GlassButton asChild variant="ghost" size="sm">
                <Link href={previewHref} target="_blank">
                  <EyeIcon size={14} /> {t("openReader")}
                </Link>
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                size="sm"
                onClick={() => void persist()}
                disabled={saving}
              >
                {t("save")}
              </GlassButton>
            </div>
          </div>
          {error && (
            <p className="text-[0.8rem] text-[color:var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onImportFile}
          />
        </div>

        {/* PAGES BAR */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-2 backdrop-blur-md">
          {pages.map((p, i) => (
            <button
              key={p.localId}
              type="button"
              onClick={() => {
                setCurrentPageId(p.localId);
                setSelectedId(null);
              }}
              aria-pressed={p.localId === currentPage?.localId}
              className={cn(
                "rounded-full px-3 py-1 text-[0.8rem] transition-colors",
                p.localId === currentPage?.localId
                  ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)]"
                  : "border border-[color:var(--glass-border)] text-text-soft hover:text-text"
              )}
            >
              {p.title.trim() || t("pages.untitled", { n: i + 1 })}
            </button>
          ))}
          <GlassButton type="button" variant="ghost" size="sm" onClick={addPage} aria-label={t("pages.add")}>
            <PlusIcon size={14} /> {t("pages.add")}
          </GlassButton>
        </div>

        {/* CURRENT PAGE CONTROLS */}
        {currentPage && (
          <div className="flex flex-wrap items-center gap-2">
            <GlassInput
              size="sm"
              value={currentPage.title}
              onChange={(e) => renameCurrentPage(e.target.value)}
              placeholder={t("field.pageTitle")}
              aria-label={t("field.pageTitle")}
              className="min-w-[8rem] flex-1"
            />
            <span className="font-mono text-[0.72rem] text-muted">
              {currentBlocks.length}/{maxBlocksPerPage}
            </span>
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => movePage(currentPage.localId, -1)}
              disabled={pages[0]?.localId === currentPage.localId}
              aria-label={t("pages.moveLeft")}
            >
              <ChevronLeftIcon size={14} />
            </GlassButton>
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => movePage(currentPage.localId, 1)}
              disabled={pages[pages.length - 1]?.localId === currentPage.localId}
              aria-label={t("pages.moveRight")}
            >
              <ChevronRightIcon size={14} />
            </GlassButton>
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePage(currentPage.localId)}
              disabled={pages.length <= 1}
              aria-label={t("pages.delete")}
              className="text-[color:var(--color-danger)]"
            >
              <TrashIcon size={14} />
            </GlassButton>
          </div>
        )}

        <div className={cn("gap-4", showCanvas && showPreview ? "grid lg:grid-cols-2" : "block")}>
          {showCanvas && (
            <div>
              {currentBlocks.length === 0 ? (
                <div className="rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)] p-10 text-center text-text-soft">
                  {t("canvasEmpty")}
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext
                    items={currentBlocks.map((b) => b.localId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-2">
                      {currentBlocks.map((b) => (
                        <CanvasRow
                          key={b.localId}
                          block={b}
                          selected={b.localId === selectedId}
                          onSelect={() => setSelectedId(b.localId)}
                          onRemove={() => removeBlock(b.localId)}
                          previewText={previewText(b)}
                          removeLabel={t("deleteBlock")}
                          dragLabel={t("dragHandle")}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}

          {showPreview && (
            <div className="rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-5 backdrop-blur-md">
              {renderBlocks.length === 0 ? (
                <p className="text-center text-text-soft">{t("previewEmpty")}</p>
              ) : (
                renderBlocks.map((rb) => {
                  const mod = getModule(rb.kind);
                  if (!mod) return null;
                  const Render = mod.Render;
                  return <Render key={rb.id} block={rb} />;
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — inspector + stats */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4">
          <div className="rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-4 backdrop-blur-md">
            <h2 className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
              {t("inspectorTitle")}
            </h2>
            {selected ? (
              <InspectorBody
                key={selected.localId}
                kind={selected.kind}
                payload={selected.payload}
                onPatch={(patch) => patchBlock(selected.localId, patch)}
              />
            ) : (
              <p className="text-[0.85rem] text-text-soft">{t("inspectorEmpty")}</p>
            )}
          </div>

          <div className="rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-4 backdrop-blur-md">
            <h2 className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
              {t("statsTitle")}
            </h2>
            <dl className="grid grid-cols-4 gap-2 text-center">
              <Stat value={pages.length} label={t("stats.pages")} />
              <Stat value={totalBlocks} label={t("stats.blocks")} />
              <Stat value={words} label={t("stats.words")} />
              <Stat value={minutes} label={t("stats.minutes")} />
            </dl>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dd className="font-display text-[1.4rem] text-text">{value}</dd>
      <dt className="text-[0.68rem] text-muted">{label}</dt>
    </div>
  );
}

function InspectorBody({
  kind,
  payload,
  onPatch,
}: {
  kind: CourseBlockKind;
  payload: BlockPayload;
  onPatch: (patch: BlockPayload) => void;
}) {
  const mod = getModule(kind);
  if (!mod) return null;
  const Edit = mod.Edit;
  return (
    <div className="space-y-2">
      <span className="inline-block rounded-full bg-[color:var(--glass-bg-strong)] px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
        {kind}
      </span>
      <Edit payload={payload} onPatch={onPatch} />
    </div>
  );
}

function CanvasRow({
  block,
  selected,
  onSelect,
  onRemove,
  previewText,
  removeLabel,
  dragLabel,
}: {
  block: DraftBlock;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  previewText: string;
  removeLabel: string;
  dragLabel: string;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.localId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  } as React.CSSProperties;

  return (
    <li ref={setNodeRef} style={style}>
      <div
        onClick={onSelect}
        className={cn(
          "flex items-center gap-2 rounded-[var(--r)] border bg-[color:var(--glass-bg-strong)] p-2.5 transition-colors",
          selected
            ? "border-[color:var(--color-accent)] shadow-[0_0_0_2px_var(--color-accent-soft)]"
            : "border-[color:var(--glass-border)] hover:border-[color:var(--color-accent)]"
        )}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={dragLabel}
          className="cursor-grab touch-none text-muted hover:text-text active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVerticalIcon size={16} />
        </button>
        <span className="shrink-0 rounded bg-[color:var(--glass-bg)] px-1.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.08em] text-muted">
          {block.kind}
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.85rem] text-text-soft">
          {previewText || "—"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={removeLabel}
          className="text-muted hover:text-[color:var(--color-danger)]"
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </li>
  );
}
