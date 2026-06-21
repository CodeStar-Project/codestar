import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getMyBookmarks } from "@/app/actions/bookmarks";
import { requireAuth } from "@/components/admin/role-guard";
import { EmptyState } from "@/components/course/empty-state";
import { PageHeader } from "@/components/course/page-header";
import { StudentShell } from "@/components/course/student-shell";
import { GlassCard, GlassCardContent, GlassCardTitle } from "@/components/ui/glass-card";
import { ArrowRightIcon, BookmarkFilledIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Cours enregistrés" };

export default async function BookmarksPage() {
  await requireAuth();
  const [t, bookmarks] = await Promise.all([
    getTranslations("bookmarks"),
    getMyBookmarks(),
  ]);

  // One saved course per courseId (the bookmark is anchored on the first block).
  const byCourse = new Map<string, { title: string; slug: string }>();
  for (const b of bookmarks) {
    if (!byCourse.has(b.courseId)) {
      byCourse.set(b.courseId, { title: b.courseTitle, slug: b.courseSlug });
    }
  }
  const courses = [...byCourse.values()];

  return (
    <StudentShell maxWidth="wide">
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />

      {courses.length === 0 ? (
        <EmptyState icon={<BookmarkFilledIcon size={22} />} title={t("empty")} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <li key={c.slug}>
              <Link href={`/courses/${c.slug}`} className="block focus-visible:outline-none">
                <GlassCard variant="default" interactive className="h-full">
                  <GlassCardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                      <BookmarkFilledIcon size={13} className="text-[color:var(--color-accent)]" />
                      {t("kicker")}
                    </div>
                    <GlassCardTitle as="h2" className="text-[1.15rem]">
                      {c.title}
                    </GlassCardTitle>
                    <span className="mt-auto inline-flex items-center gap-1 text-[0.85rem] text-[color:var(--color-accent)]">
                      {t("open")} <ArrowRightIcon size={14} />
                    </span>
                  </GlassCardContent>
                </GlassCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StudentShell>
  );
}
