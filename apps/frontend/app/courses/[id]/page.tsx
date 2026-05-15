import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCourseById } from "@/app/actions/courses";
import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardTitle,
} from "@/components/ui/glass-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId) || courseId <= 0) return {};

  const course = await getCourseById(courseId);
  if (!course) return {};

  return {
    title: course.title,
    description: course.description,
  };
}

// TODO

export default async function CoursePage({ params }: PageProps) {
  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isFinite(courseId) || courseId <= 0) notFound();

  const [course, t] = await Promise.all([
    getCourseById(courseId),
    getTranslations("course"),
  ]);

  if (!course) notFound();

  return (
    <>
      <TopNav />
      <main id="main" className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
        <GlassButton asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">← {t("back")}</Link>
        </GlassButton>

        <header className="mb-10">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tight text-text">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] text-text-soft">
            {course.description}
          </p>
        </header>

        <ul className="space-y-5">
          {course.pages.map((page) => (
            <li key={page.pageNumber}>
              <GlassCard variant="default" className="p-6">
                <GlassCardContent className="p-0">
                  <GlassCardTitle as="h2" className="text-[1.2rem]">
                    {t("pageLabel", { number: page.pageNumber })}
                  </GlassCardTitle>
                  <GlassCardDescription className="mt-2">
                    {t("blocksCount", { count: page.blocks.length })}
                  </GlassCardDescription>
                </GlassCardContent>
              </GlassCard>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
