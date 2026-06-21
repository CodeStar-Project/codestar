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
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import { GlassInput } from "@/components/ui/glass-input";
import {
  ArrowRightIcon,
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
  CourseLevel,
  CoursePage,
  CourseStatus,
  PageInput,
  UpdateCoursePayload,
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

type View = "edit" | "preview";
type Mode = "start" | "build";
const AUTOSAVE_MS = 1500;

const KIND_LABEL_KEY: Record<CourseBlockKind, string> = {
  H1: "palette.h1",
  H2: "palette.h2",
  H3: "palette.h3",
  H4: "palette.h4",
  H5: "palette.h5",
  H6: "palette.h6",
  P: "palette.p",
  QUOTE: "palette.quote",
  CODE: "palette.code",
  CALLOUT: "palette.callout",
  IMAGE: "palette.image",
  TABLE: "palette.table",
  QUIZ: "palette.quiz",
  SANDBOX: "palette.sandbox",
};

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

function hasAnyBlock(pages: CoursePage[]): boolean {
  return pages.some((p) => p.blocks.length > 0);
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

  const [mode, setMode] = useState<Mode>(() =>
    hasAnyBlock(initialPages) ? "build" : "start"
  );
  const [pages, setPages] = useState<DraftPage[]>(() =>
    initialPages.length > 0 ? initialPages.map(toDraftPage) : [emptyPage()]
  );
  const [currentPageId, setCurrentPageId] = useState<string>(
    () => (initialPages[0]?.id ?? null) ?? ""
  );
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<CourseStatus>(initialStatus);
  const [view, setView] = useState<View>("edit");
  const [pickerAt, setPickerAt] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startMeta] = useTransition();
  const [publishing, startPublish] = useTransition();
  const [importing, startImport] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSavedJson = useRef<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const currentPage =
    pages.find((p) => p.localId === currentPageId) ?? pages[0];
  const currentBlocks = useMemo(() => currentPage?.blocks ?? [], [currentPage]);
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
    setPickerAt(null);
    markDirty();
  }

  function removePage(localId: string) {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((p) => p.localId === localId);
      const next = prev.filter((p) => p.localId !== localId);
      const fallback = next[Math.max(0, idx - 1)];
      setCurrentPageId(fallback.localId);
      return next;
    });
    setPickerAt(null);
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

  function addEntryAt(entry: PaletteEntry, index: number) {
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
      const blocks = [...p.blocks];
      const at = Math.max(0, Math.min(index, blocks.length));
      blocks.splice(at, 0, draft);
      return { ...p, blocks };
    });
  }

  function moveBlock(localId: string, delta: number) {
    updateCurrentPage((p) => {
      const i = p.blocks.findIndex((b) => b.localId === localId);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= p.blocks.length) return p;
      return { ...p, blocks: arrayMove(p.blocks, i, j) };
    });
  }

  function removeBlock(localId: string) {
    updateCurrentPage((p) => ({
      ...p,
      blocks: p.blocks.filter((b) => b.localId !== localId),
    }));
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
    if (!dirty || mode !== "build") return;
    const id = setTimeout(() => void persist(), AUTOSAVE_MS);
    return () => clearTimeout(id);
  }, [dirty, mode, persist]);

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

  // ---- publish ----
  async function onPublish() {
    const ok = await persist();
    if (!ok) return;
    startPublish(async () => {
      const r = await changeCourseStatus(courseId, "PUBLISHED");
      if (!r.ok) {
        setError(r.error ?? tErr("unknown"));
        return;
      }
      setStatus("PUBLISHED");
      // Publication terminée : on renvoie vers le tableau de bord des cours.
      router.push("/admin/courses");
      router.refresh();
    });
  }

  function onUnpublish() {
    startPublish(async () => {
      const r = await changeCourseStatus(courseId, "DRAFT");
      if (!r.ok) {
        setError(r.error ?? tErr("unknown"));
        return;
      }
      setStatus("DRAFT");
      router.refresh();
    });
  }

  // ---- export ----
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

  // ---- import (fills the CURRENT course) ----
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

        const importedPages: DraftPage[] = parsed.pages.map((p) => ({
          localId: nextId(),
          title: p.title ?? "",
          blocks: (p.blocks ?? []).map((b) => ({
            localId: nextId(),
            kind: b.kind,
            payload: { ...(b.payload ?? {}) },
          })),
        }));
        if (importedPages.length === 0) importedPages.push(emptyPage());

        const payload: PageInput[] = importedPages.map((p) => ({
          title: p.title.trim() || null,
          blocks: p.blocks.map((b) => ({
            kind: b.kind,
            payload: normalizePayload(b.kind, b.payload),
          })),
        }));

        startImport(async () => {
          // 1) Replace the course content.
          const r = await saveCoursePages(courseId, payload);
          if (!r.ok) {
            setError(r.error ?? tErr("unknown"));
            return;
          }
          // 2) Overwrite the course metadata from the file (slug stays untouched).
          const meta = parsed.course;
          const metaPatch: UpdateCoursePayload = {};
          if (meta.title) metaPatch.title = meta.title;
          if (meta.description != null) metaPatch.description = meta.description ?? undefined;
          if (meta.category != null) metaPatch.category = meta.category ?? undefined;
          if (meta.level) metaPatch.level = meta.level as CourseLevel;
          if (Object.keys(metaPatch).length > 0) {
            await updateCourse(courseId, metaPatch);
          }
          // 3) Reflect the imported content locally.
          setPages(importedPages);
          setCurrentPageId(importedPages[0].localId);
          setPickerAt(null);
          if (meta.title) setTitle(meta.title);
          lastSavedJson.current = JSON.stringify(payload);
          setSavedAt(Date.now());
          setDirty(false);
          setMode("build");
          router.refresh();
        });
      })
      .catch(() => setError(tErr("unknown")));
  }

  const totalBlocks = useMemo(
    () => pages.reduce((acc, p) => acc + p.blocks.length, 0),
    [pages]
  );
  const words = useMemo(() => countWords(pages), [pages]);
  const minutes = Math.max(1, Math.ceil(words / 200));
  const pageWords = useMemo(
    () => (currentPage ? countWords([currentPage]) : 0),
    [currentPage]
  );
  const pageMinutes = Math.max(1, Math.ceil(pageWords / 200));

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="application/json,.json"
      className="hidden"
      onChange={onImportFile}
    />
  );

  // ---- START SCREEN ----
  if (mode === "start") {
    return (
      <div className="mx-auto max-w-3xl">
        {fileInput}
        <div className="mb-7 text-center">
          <h2 className="font-display text-[1.7rem] text-text">{t("start.title")}</h2>
          <p className="mt-1 text-text-soft">{t("start.lead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard variant="default" interactive>
            <GlassCardContent className="flex h-full flex-col gap-3 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--r)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]">
                <UploadIcon size={20} />
              </span>
              <h3 className="font-display text-[1.3rem] text-text">{t("start.importTitle")}</h3>
              <p className="flex-1 text-[0.92rem] text-text-soft">{t("start.importDesc")}</p>
              <div>
                <GlassButton
                  type="button"
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  loading={importing}
                >
                  <UploadIcon size={15} /> {t("start.importButton")}
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard variant="default" interactive>
            <GlassCardContent className="flex h-full flex-col gap-3 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--r)] bg-[color:var(--glass-bg-strong)] text-text-soft">
                <PlusIcon size={20} />
              </span>
              <h3 className="font-display text-[1.3rem] text-text">{t("start.composeTitle")}</h3>
              <p className="flex-1 text-[0.92rem] text-text-soft">{t("start.composeDesc")}</p>
              <div>
                <GlassButton type="button" variant="glass" onClick={() => setMode("build")}>
                  <PlusIcon size={15} /> {t("start.composeButton")}
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
        {error && (
          <p className="mt-4 text-center text-[0.85rem] text-[color:var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ---- block picker (shared between inserters) ----
  function renderInserter(index: number) {
    const open = pickerAt === index;
    return (
      <div className="relative flex justify-center py-1.5">
        {open && (
          <>
            <div
              className="fixed inset-0 z-20"
              aria-hidden
              onClick={() => setPickerAt(null)}
            />
            <div className="absolute top-full z-30 mt-1 w-[min(30rem,92vw)] rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] p-3 shadow-[var(--glass-shadow)] backdrop-blur-xl">
              {PALETTE_GROUPS.map((group) => (
                <div key={group} className="mb-2.5 last:mb-0">
                  <div className="mb-1 px-1 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
                    {t(`group.${group}`)}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {paletteByGroup(group).map((entry) => {
                      const Icon = entry.icon;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            addEntryAt(entry, index);
                            setPickerAt(null);
                          }}
                          className="flex items-center gap-1.5 rounded-[var(--r)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] px-2 py-1.5 text-left text-[0.78rem] text-text-soft transition-colors hover:border-[color:var(--color-accent)] hover:text-text"
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
          </>
        )}
        <button
          type="button"
          disabled={pageFull}
          onClick={() => setPickerAt(open ? null : index)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-[color:var(--glass-border)] px-3 py-1 text-[0.8rem] text-muted transition-colors hover:border-[color:var(--color-accent)] hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon size={14} /> {t("addBlock")}
        </button>
      </div>
    );
  }

  // ---- BUILD EDITOR ----
  return (
    <div className="mx-auto max-w-3xl">
      {fileInput}

      {/* HEADER */}
      <div className="sticky top-20 z-10 space-y-2.5 rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] p-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <GlassInput
            size="sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            aria-label={t("field.courseTitle")}
            className="min-w-[10rem] flex-1 font-display"
          />
          <GlassChip variant={status === "PUBLISHED" ? "success" : "default"} size="sm">
            {t(`status.${status}`)}
          </GlassChip>
          <div className="inline-flex rounded-full border border-[color:var(--glass-border)] p-0.5">
            {(["edit", "preview"] as View[]).map((v) => (
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

          {status === "PUBLISHED" ? (
            <>
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={onUnpublish}
                loading={publishing}
              >
                {t("unpublish")}
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
            </>
          ) : (
            <>
              <GlassButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void persist()}
                disabled={saving}
              >
                {t("saveDraft")}
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                size="sm"
                onClick={onPublish}
                loading={publishing}
                disabled={saving}
              >
                {t("publish")}
              </GlassButton>
            </>
          )}

          {/* Overflow menu — secondary actions */}
          <details className="group relative">
            <summary className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-full border border-[color:var(--glass-border)] px-3 text-[0.8rem] text-text-soft transition-colors hover:text-text [&::-webkit-details-marker]:hidden">
              {t("more")}
            </summary>
            <div className="absolute right-0 z-30 mt-1 w-56 rounded-[var(--r)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong)] p-1.5 shadow-[var(--glass-shadow)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2.5 py-2 text-left text-[0.85rem] text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text"
              >
                <UploadIcon size={15} /> {t("import.button")}
              </button>
              <button
                type="button"
                onClick={onExport}
                className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2.5 py-2 text-left text-[0.85rem] text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text"
              >
                <DownloadIcon size={15} /> {t("export.button")}
              </button>
              <Link
                href={previewHref}
                target="_blank"
                className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2.5 py-2 text-left text-[0.85rem] text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text"
              >
                <EyeIcon size={15} /> {t("openReader")}
              </Link>
              {status === "PUBLISHED" && (
                <Link
                  href={`/courses/${courseSlug}`}
                  target="_blank"
                  className="flex w-full items-center gap-2 rounded-[var(--r-sm)] px-2.5 py-2 text-left text-[0.85rem] text-text-soft transition-colors hover:bg-[color:var(--glass-bg)] hover:text-text"
                >
                  <ArrowRightIcon size={15} /> {t("viewPublic")}
                </Link>
              )}
            </div>
          </details>

          <span className="ml-auto text-[0.78rem] text-muted" aria-live="polite">
            {saving ? t("saving") : dirty ? t("unsaved") : savedAt ? t("saved") : ""}
          </span>
        </div>

        {error && (
          <p className="text-[0.8rem] text-[color:var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* PAGES STRIP */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-2 backdrop-blur-md">
        {pages.map((p, i) => (
          <button
            key={p.localId}
            type="button"
            onClick={() => {
              setCurrentPageId(p.localId);
              setPickerAt(null);
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

        {currentPage && (
          <div className="ml-auto flex items-center gap-1">
            <GlassInput
              size="sm"
              value={currentPage.title}
              onChange={(e) => renameCurrentPage(e.target.value)}
              placeholder={t("field.pageTitle")}
              aria-label={t("field.pageTitle")}
              className="w-40"
            />
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
      </div>

      {/* DOCUMENT */}
      <div className="mt-5">
        {view === "preview" ? (
          <div className="rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] p-6 backdrop-blur-md">
            {currentBlocks.length === 0 ? (
              <p className="text-center text-text-soft">{t("previewEmpty")}</p>
            ) : (
              currentBlocks.map(toRenderBlock).map((rb) => {
                const mod = getModule(rb.kind);
                if (!mod) return null;
                const Render = mod.Render;
                return <Render key={rb.id} block={rb} />;
              })
            )}
          </div>
        ) : currentBlocks.length === 0 ? (
          <div className="rounded-[var(--r-lg)] border border-dashed border-[color:var(--glass-border)] p-10 text-center">
            <p className="mb-4 text-text-soft">{t("canvasEmpty")}</p>
            {renderInserter(0)}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={currentBlocks.map((b) => b.localId)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {renderInserter(0)}
                {currentBlocks.map((b, i) => (
                  <div key={b.localId}>
                    <BlockCard
                      block={b}
                      label={t(KIND_LABEL_KEY[b.kind] as Parameters<typeof t>[0])}
                      isFirst={i === 0}
                      isLast={i === currentBlocks.length - 1}
                      onPatch={(patch) => patchBlock(b.localId, patch)}
                      onMove={(delta) => moveBlock(b.localId, delta)}
                      onRemove={() => removeBlock(b.localId)}
                      moveUpLabel={t("moveUp")}
                      moveDownLabel={t("moveDown")}
                      removeLabel={t("deleteBlock")}
                      dragLabel={t("dragHandle")}
                    />
                    {renderInserter(i + 1)}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <p className="mt-4 text-center font-mono text-[0.72rem] text-muted">
          {currentBlocks.length} {t("stats.blocks")} · ~{pageMinutes} {t("stats.minutes")}
          {pages.length > 1 && (
            <>
              {" · "}
              {pages.length} {t("stats.pages")} · {totalBlocks} {t("stats.blocks")} · ~{minutes}{" "}
              {t("stats.minutes")}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  label,
  isFirst,
  isLast,
  onPatch,
  onMove,
  onRemove,
  moveUpLabel,
  moveDownLabel,
  removeLabel,
  dragLabel,
}: {
  block: DraftBlock;
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: BlockPayload) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
  moveUpLabel: string;
  moveDownLabel: string;
  removeLabel: string;
  dragLabel: string;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.localId });
  const mod = getModule(block.kind);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  } as React.CSSProperties;

  if (!mod) return null;
  const Edit = mod.Edit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-[var(--r-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] backdrop-blur-md"
    >
      <div className="flex items-center gap-2 border-b border-[color:var(--glass-border)] px-3 py-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={dragLabel}
          className="cursor-grab touch-none text-muted hover:text-text active:cursor-grabbing"
        >
          <GripVerticalIcon size={16} />
        </button>
        <span className="flex-1 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          aria-label={moveUpLabel}
          className="rounded p-1 text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronUp />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isLast}
          aria-label={moveDownLabel}
          className="rounded p-1 text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="rounded p-1 text-muted transition-colors hover:text-[color:var(--color-danger)]"
        >
          <TrashIcon size={15} />
        </button>
      </div>
      <div className="p-3">
        <Edit payload={block.payload} onPatch={onPatch} />
      </div>
    </div>
  );
}

// Small chevrons (rotated reuse of the shared chevron set kept inline to avoid new icon files).
function ChevronUp() {
  return <ChevronLeftIcon size={15} className="rotate-90" />;
}
function ChevronDown() {
  return <ChevronRightIcon size={15} className="rotate-90" />;
}
