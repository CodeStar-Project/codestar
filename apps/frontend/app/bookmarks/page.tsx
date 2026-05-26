import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getMyBookmarks } from "@/app/actions/bookmarks";
import { requireAuth } from "@/components/admin/role-guard";
import { BookmarkRow } from "@/components/course/bookmark-row";
import { EmptyState } from "@/components/course/empty-state";
import { PageHeader } from "@/components/course/page-header";
import { StudentShell } from "@/components/course/student-shell";
import { BookmarkIcon } from "@/components/ui/icons";
import type { BookmarkEnriched } from "@/lib/types";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function BookmarksPage() {
  await requireAuth();
  const [t, bookmarks] = await Promise.all([
    getTranslations("bookmarks"),
    getMyBookmarks(),
  ]);

  const byCourse = new Map<string, { title: string; slug: string; items: BookmarkEnriched[] }>();
  for (const b of bookmarks) {
    const k = b.courseId;
    if (!byCourse.has(k)) {
      byCourse.set(k, { title: b.courseTitle, slug: b.courseSlug, items: [] });
    }
    byCourse.get(k)!.items.push(b);
  }
  for (const entry of byCourse.values()) {
    entry.items.sort((a, b) => a.blockOrderIndex - b.blockOrderIndex);
  }

  return (
    <StudentShell maxWidth="wide">
      <PageHeader
        kicker={t("kicker")}
        title={t("title")}
        description={t("description")}
        className="mb-10"
      />

      {bookmarks.length === 0 ? (
        <EmptyState icon={<BookmarkIcon size={22} />} title={t("empty")} />
      ) : (
        <div className="space-y-12">
          {[...byCourse.entries()].map(([id, group]) => (
            <section key={id}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-display text-xl tracking-tight text-text md:text-2xl">
                  <Link
                    href={`/courses/${group.slug}`}
                    className="hover:text-[color:var(--color-accent)]"
                  >
                    {group.title}
                  </Link>
                </h2>
                <span className="text-[0.82rem] text-muted">
                  {t("bookmarksCount", { count: group.items.length })}
                </span>
              </div>
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((b) => (
                  <li key={b.id}>
                    <BookmarkRow
                      bookmark={b}
                      labelView={t("viewBlock")}
                      labelRemove={t("remove")}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </StudentShell>
  );
}
