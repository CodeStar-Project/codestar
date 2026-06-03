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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: course.title };
}

export default async function CourseReaderPage({ params }: PageProps) {
  await requireAuth();
  const { slug } = await params;
  const [t, course] = await Promise.all([
    getTranslations("course.reader"),
    getCourseBySlug(slug),
  ]);
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
  // Flat list for the TOC / mobile TOC (headings across all pages).
  const blocks = pages.flatMap((p) => p.blocks);

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
            blocks={blocks}
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
          <div className="sticky top-24">
            <BlockToc blocks={blocks} label={t("toc")} />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-8 border-b border-[color:var(--glass-border)] pb-6">
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">
              {t("kicker")}
            </div>
            <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight tracking-tight text-text">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-3 max-w-2xl text-[1rem] text-text-soft">
                {course.description}
              </p>
            )}
          </header>

          {blocks.length === 0 ? (
            <GlassCard variant="plain" className="p-10 text-center">
              <GlassCardContent className="p-0">
                <p className="text-text-soft">{t("empty")}</p>
              </GlassCardContent>
            </GlassCard>
          ) : (
            <div className="space-y-12">
              {pages.map((page) => (
                <section key={page.id} aria-label={page.title ?? undefined}>
                  {page.title && (
                    <h2
                      id={`page-${page.id}`}
                      className="mb-4 scroll-mt-24 font-display text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-text"
                    >
                      {page.title}
                    </h2>
                  )}
                  <div className="space-y-2">
                    {page.blocks.map((b) => (
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
                </section>
              ))}
            </div>
          )}

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--glass-border)] pt-6">
            <GlassButton asChild variant="ghost" size="sm">
              <Link href={`/courses/${course.slug}`}>
                <ChevronLeftIcon size={14} /> {t("backToIntro")}
              </Link>
            </GlassButton>
            <GlassButton asChild variant="primary" size="sm">
              <Link href="/my-courses">
                {t("next")} <ArrowRightIcon size={14} />
              </Link>
            </GlassButton>
          </footer>
        </article>
      </div>
    </StudentShell>
  );
}
