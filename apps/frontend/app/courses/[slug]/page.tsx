import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { getCourseBookmarks } from "@/app/actions/bookmarks";
import { getCourseBySlug } from "@/app/actions/courses";
import { getMyEnrollments } from "@/app/actions/enrollments";
import { requireAuth } from "@/components/admin/role-guard";
import { CourseMeta } from "@/components/course/course-meta";
import { PageHeader } from "@/components/course/page-header";
import { ProgressBar } from "@/components/course/progress-bar";
import { StatCard } from "@/components/course/stat-card";
import { StudentShell } from "@/components/course/student-shell";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import {
  ArrowRightIcon,
  BookIcon,
  BookmarkIcon,
  ClockIcon,
  PlayIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { formatDate, parseProgress } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.description ?? undefined,
  };
}

export default async function CourseIntroPage({ params }: PageProps) {
  await requireAuth();
  const { slug } = await params;
  const locale = (await getLocale()) as "fr" | "en";

  const [t, course] = await Promise.all([
    getTranslations("course.intro"),
    getCourseBySlug(slug),
  ]);

  if (!course) notFound();

  const [enrollments, bookmarks] = await Promise.all([
    getMyEnrollments(),
    getCourseBookmarks(course.id),
  ]);

  const enrollment = enrollments.find((e) => e.courseId === course.id) ?? null;
  const progress = enrollment ? parseProgress(enrollment.progress) : 0;
  const isCompleted = progress >= 1;
  const isStarted = progress > 0 && !isCompleted;

  const ctaLabel = isCompleted
    ? t("review")
    : isStarted
    ? t("resume")
    : t("start");

  const blocksCount = course.blocks?.length ?? 0;
  const headings = (course.blocks ?? []).filter((b) =>
    ["H1", "H2"].includes(b.kind)
  );
  const lessonCount = headings.length || blocksCount;

  return (
    <StudentShell maxWidth="default">
      <GlassButton asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/courses">← {t("backToCatalog")}</Link>
      </GlassButton>

      <PageHeader
        kicker={course.authorName ? t("byAuthor", { author: course.authorName }) : undefined}
        title={course.title}
        description={course.description}
        actions={
          <GlassButton asChild variant="primary" size="lg">
            <Link href={`/courses/${course.slug}/read`}>
              <PlayIcon size={14} />
              {ctaLabel}
              <ArrowRightIcon size={14} />
            </Link>
          </GlassButton>
        }
        className="mb-8"
      />

      <div className="mb-10">
        <CourseMeta
          category={course.category}
          level={course.level}
          status={course.status}
          locale={locale}
          showStatus={course.status !== "PUBLISHED"}
          size="md"
        />
      </div>

      {enrollment && (
        <div className="mb-10">
          <div className="mb-2 flex items-center justify-between text-[0.85rem] text-text-soft">
            <span>{t("progressLabel")}</span>
            <span className="font-mono">{Math.round(progress * 100)}%</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("lessons", { count: lessonCount })}
          value={lessonCount}
          icon={<BookIcon size={18} />}
        />
        <StatCard
          label={t("statsLearners")}
          value="—"
          icon={<UsersIcon size={18} />}
        />
        <StatCard
          label={t("statsCompletion")}
          value="—"
          icon={<ClockIcon size={18} />}
        />
      </div>

      {course.publishedAt && (
        <p className="mt-6 text-[0.85rem] text-muted">
          {t("publishedOn", { date: formatDate(course.publishedAt, locale) })}
        </p>
      )}

      <section className="mt-14">
        <h2 className="mb-5 font-display text-2xl tracking-tight text-text md:text-3xl">
          {t("bookmarksTitle")}
        </h2>
        {bookmarks.length === 0 ? (
          <GlassCard variant="plain" className="p-8 text-center">
            <BookmarkIcon
              size={28}
              className="mx-auto mb-3 text-muted"
            />
            <p className="text-text-soft">{t("bookmarksEmpty")}</p>
            <GlassButton asChild variant="ghost" size="sm" className="mt-4">
              <Link href={`/courses/${course.slug}/read`}>{t("openReader")}</Link>
            </GlassButton>
          </GlassCard>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/courses/${course.slug}/read#block-${b.blockId}`}
                  className="block focus-visible:outline-none"
                >
                  <GlassCard variant="default" interactive className="h-full">
                    <GlassCardContent className="flex h-full flex-col gap-2 p-4">
                      <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                        <BookmarkIcon size={12} />
                        {b.blockKind} · #{b.blockOrderIndex + 1}
                      </div>
                      <GlassCardTitle as="h3" className="text-[1rem]">
                        {b.blockPreview ?? `Bloc ${b.blockOrderIndex + 1}`}
                      </GlassCardTitle>
                    </GlassCardContent>
                  </GlassCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </StudentShell>
  );
}
