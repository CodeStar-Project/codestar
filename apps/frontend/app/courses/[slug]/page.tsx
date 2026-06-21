import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { getCourseBookmarks } from "@/app/actions/bookmarks";
import { getCourseBySlug } from "@/app/actions/courses";
import { getMyEnrollments } from "@/app/actions/enrollments";
import { requireAuth } from "@/components/admin/role-guard";
import { CourseMeta } from "@/components/course/course-meta";
import { CourseSaveButton } from "@/components/course/course-save-button";
import { PageHeader } from "@/components/course/page-header";
import { ProgressBar } from "@/components/course/progress-bar";
import { StatCard } from "@/components/course/stat-card";
import { StudentShell } from "@/components/course/student-shell";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowRightIcon,
  BookIcon,
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

  const sortedPages = [...(course.pages ?? [])].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const allBlocks = sortedPages.flatMap((p) => p.blocks);
  const blocksCount = allBlocks.length;
  const headings = allBlocks.filter((b) => ["H1", "H2"].includes(b.kind));
  // A page maps to a lesson; fall back to headings/blocks for legacy single-page courses.
  const lessonCount = (course.pages?.length ?? 0) || headings.length || blocksCount;

  // Course-level "save": anchored on the first block (cf. CourseSaveButton).
  const firstBlockId =
    [...(sortedPages[0]?.blocks ?? [])].sort(
      (a, b) => a.orderIndex - b.orderIndex
    )[0]?.id ?? null;
  const savedId = bookmarks[0]?.id ?? null;

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
          <>
            <GlassButton asChild variant="primary" size="lg">
              <Link href={`/courses/${course.slug}/read`}>
                <PlayIcon size={14} />
                {ctaLabel}
                <ArrowRightIcon size={14} />
              </Link>
            </GlassButton>
            <CourseSaveButton
              courseId={course.id}
              firstBlockId={firstBlockId}
              initialId={savedId}
              labelSave={t("save")}
              labelSaved={t("saved")}
              size="lg"
            />
          </>
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
    </StudentShell>
  );
}
