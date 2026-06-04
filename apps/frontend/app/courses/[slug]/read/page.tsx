import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCourseBookmarks } from "@/app/actions/bookmarks";
import { getCourseBySlug } from "@/app/actions/courses";
import { requireAuth } from "@/components/admin/role-guard";
import { BlockRenderer } from "@/components/course/block-renderer";
import { BlockToc, blockSlug } from "@/components/course/block-toc";
import { BookmarkButton } from "@/components/course/bookmark-button";
import { MobileToc } from "@/components/course/mobile-toc";
import { StudentShell } from "@/components/course/student-shell";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import {
  ArrowRightIcon,
  BookmarkIcon,
  ChevronLeftIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: course.title };
}

/** 1-based page number clamped to [1, total]. */
function clampPage(raw: string | string[] | undefined, total: number): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, total));
}

export default async function CourseReaderPage({ params, searchParams }: PageProps) {
  await requireAuth();
  const [{ slug }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("course.reader"),
  ]);
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const bookmarks = await getCourseBookmarks(course.id);
  const bookmarkMap = new Map<string, string>(
    bookmarks.map((b) => [b.blockId, b.id])
  );

  const pages = [...(course.pages ?? [])]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((p) => ({
      ...p,
      blocks: [...p.blocks].sort((a, b) => a.orderIndex - b.orderIndex),
    }));

  const total = pages.length;
  const current = clampPage(sp.page, total); // 1-based
  const page = pages[current - 1];
  const pageBlocks = page?.blocks ?? [];

  const readHref = `/courses/${course.slug}/read`;
  const pageHref = (n: number) => `${readHref}?page=${n}`;
  const isFirst = current <= 1;
  const isLast = current >= total;
  const prevHref = isFirst ? `/courses/${course.slug}` : pageHref(current - 1);
  const nextHref = isLast ? "/my-courses" : pageHref(current + 1);

  return (
    <StudentShell maxWidth="wide" className="md:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <GlassButton asChild variant="ghost" size="sm">
          <Link href={`/courses/${course.slug}`}>
            <ChevronLeftIcon size={14} />
            {t("backToIntro")}
          </Link>
        </GlassButton>
        <div className="flex flex-wrap items-center gap-2">
          <MobileToc
            blocks={pageBlocks}
            label={t("toc")}
            triggerLabel={t("tocMobile")}
          />
          <GlassButton asChild variant="ghost" size="sm">
            <Link href="/bookmarks">
              <BookmarkIcon size={14} />
              {t("viewBookmarks")}
            </Link>
          </GlassButton>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {total > 1 && (
              <nav aria-label={t("pagesTitle")}>
                <div className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  {t("pagesTitle")}
                </div>
                <ol className="space-y-1">
                  {pages.map((p, i) => {
                    const n = i + 1;
                    const active = n === current;
                    return (
                      <li key={p.id}>
                        <Link
                          href={pageHref(n)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2 rounded-[var(--r-sm)] px-2 py-1 text-[0.85rem] transition-colors",
                            active
                              ? "bg-[color:var(--color-accent-soft)] text-text"
                              : "text-text-soft hover:bg-[color:var(--glass-bg)] hover:text-text"
                          )}
                        >
                          <span className="font-mono text-[0.72rem] text-muted">
                            {n}
                          </span>
                          <span className="truncate">
                            {p.title?.trim() || `${t("pagesTitle")} ${n}`}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}
            <BlockToc blocks={pageBlocks} label={t("toc")} />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-8 border-b border-[color:var(--glass-border)] pb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
                {t("kicker")}
              </div>
              {total > 1 && (
                <div className="font-mono text-[0.72rem] text-muted">
                  {t("pageLabel", { current, total })}
                </div>
              )}
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight tracking-tight text-text">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-3 max-w-2xl text-[1rem] text-text-soft">
                {course.description}
              </p>
            )}
            {page?.title && (
              <h2 className="mt-5 font-display text-[clamp(1.3rem,2.4vw,1.9rem)] leading-tight text-text-soft">
                {page.title}
              </h2>
            )}
          </header>

          {pageBlocks.length === 0 ? (
            <GlassCard variant="plain" className="p-10 text-center">
              <GlassCardContent className="p-0">
                <p className="text-text-soft">{t("empty")}</p>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {pageBlocks.map((b) => (
                <div key={b.id} className="group relative">
                  <div className="absolute -left-12 top-1 hidden opacity-0 transition-opacity group-hover:opacity-100 lg:block">
                    <BookmarkButton
                      courseId={course.id}
                      blockId={b.id}
                      initialId={bookmarkMap.get(b.id) ?? null}
                      labelAdd={t("addBookmark")}
                      labelRemove={t("removeBookmark")}
                    />
                  </div>
                  <BlockRenderer block={b} id={blockSlug(b)} />
                  <div className="mt-1 lg:hidden">
                    <BookmarkButton
                      courseId={course.id}
                      blockId={b.id}
                      initialId={bookmarkMap.get(b.id) ?? null}
                      labelAdd={t("addBookmark")}
                      labelRemove={t("removeBookmark")}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--glass-border)] pt-6">
            <GlassButton asChild variant="ghost" size="sm">
              <Link href={prevHref}>
                <ChevronLeftIcon size={14} /> {isFirst ? t("backToIntro") : t("prev")}
              </Link>
            </GlassButton>
            <GlassButton asChild variant="primary" size="sm">
              <Link href={nextHref}>
                {isLast ? t("finish") : t("next")} <ArrowRightIcon size={14} />
              </Link>
            </GlassButton>
          </footer>
        </article>
      </div>
    </StudentShell>
  );
}
