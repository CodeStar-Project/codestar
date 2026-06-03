import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { getMe } from "@/app/actions/auth";
import { getInstanceBranding } from "@/app/actions/instance";
import { SiteFooter } from "@/components/site-footer";
import { TopNav } from "@/components/top-nav";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { GlassChip } from "@/components/ui/glass-chip";
import {
  ArrowRightIcon,
  BookIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
} from "@/components/ui/icons";
import { getPublishedCourses } from "@/app/actions/courses";
import type { CourseSummary } from "@/lib/types";

export default async function HomePage() {
  const [tInstance, branding, me] = await Promise.all([
    getTranslations("instance"),
    getInstanceBranding(),
    getMe(),
  ]);

  const courses = me ? await getPublishedCourses() : [];

  const heroTitle = branding.heroTitle ?? tInstance("heroTitle");
  const heroSubtitle = branding.heroSubtitle ?? tInstance("heroSubtitle");
  const heroCta = branding.heroCta ?? tInstance("heroCta");

  return (
    <>
      <TopNav />

      <main id="main">
        <Hero title={heroTitle} subtitle={heroSubtitle} cta={heroCta} />
        <FeaturedCourses courses={courses} />
        <Pillars />
        <FinalCta />
      </main>

      <SiteFooter />
    </>
  );
}

async function Hero({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: string;
}) {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <GlassChip variant="accent" size="md" className="mb-6">
              <StarIcon size={13} />
              {t("chip")}
            </GlassChip>

            <h1 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] leading-[1.04] tracking-tight text-text">
              {title}
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-text-soft md:text-[1.15rem]">
              {subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <GlassButton asChild variant="primary" size="lg">
                <Link href="/login?mode=signup">
                  <SparklesIcon size={16} />
                  {cta}
                  <ArrowRightIcon size={14} />
                </Link>
              </GlassButton>

              <GlassButton variant="outline" size="lg" disabled>
                {t("ctaSecondary")}
                <GlassChip variant="default" size="sm" className="ml-1">
                  {t("comingSoon")}
                </GlassChip>
              </GlassButton>
            </div>

            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.85rem] text-muted">
              <div className="flex items-baseline gap-2">
                <dt className="sr-only">{t("stats.courses")}</dt>
                <dd className="font-semibold text-text">12+</dd>
                <span>{t("stats.courses")}</span>
              </div>
              <span aria-hidden>·</span>
              <div className="flex items-baseline gap-2">
                <dt className="sr-only">{t("stats.learners")}</dt>
                <dd className="font-semibold text-text">
                  {t("stats.learnersValue", { count: 2400 })}
                </dd>
                <span>{t("stats.learners")}</span>
              </div>
              <span aria-hidden>·</span>
              <div className="flex items-baseline gap-2">
                <dt className="sr-only">
                  {t("stats.ratingLabel", { value: "★ 4,8" })}
                </dt>
                <dd className="font-semibold text-text">★ 4,8</dd>
                <span>{t("stats.ratingLabel", { value: "" }).trim()}</span>
              </div>
            </dl>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

async function HeroVisual() {
  const [t, branding] = await Promise.all([
    getTranslations("home.hero"),
    getInstanceBranding(),
  ]);
  return (
    <div className="relative">
      <GlassCard
        variant="strong"
        className="aspect-[4/3] overflow-hidden p-0 md:aspect-[5/4]"
      >
        <div
          className="relative h-full w-full"
          style={{
            background: `linear-gradient(135deg, ${branding.accent}, ${branding.accent}99)`,
          }}
        >
          <div className="absolute inset-0 flex items-end p-6 md:p-8">
            <div>
              <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-white/85">
                {t("previewLabel")}
              </div>
              <div className="mt-2 font-display text-3xl text-white md:text-4xl">
                {branding.name}
              </div>
              {branding.tagline ? (
                <div className="mt-1 max-w-xs text-[0.9rem] text-white/85">
                  {branding.tagline}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

async function FeaturedCourses({ courses }: { courses: CourseSummary[] }) {
  courses = courses.slice(0, 3);
  if (courses.length === 0) return null;
  const t = await getTranslations("home.featured");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl tracking-tight text-text md:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-md text-[0.95rem] text-text-soft">
            {t("subtitle")}
          </p>
        </div>

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <FeaturedCard
              key={course.id}
              course={course}
              linkAria={t("linkAria", { title: course.title })}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedCard({
  course,
  linkAria,
}: {
  course: CourseSummary;
  linkAria: string;
}) {
  return (
    <li>
      <Link
        href={`/courses/${course.slug}`}
        className="block focus-visible:outline-none"
        aria-label={linkAria}
      >
        <GlassCard variant="default" interactive className="h-full">
          <GlassCardContent className="flex h-full flex-col gap-3 p-5">
            <GlassCardTitle as="h3" className="text-[1.15rem]">
              {course.title}
            </GlassCardTitle>
            <GlassCardDescription className="text-[0.9rem]">
              {course.description}
            </GlassCardDescription>
          </GlassCardContent>
        </GlassCard>
      </Link>
    </li>
  );
}

async function Pillars() {
  const t = await getTranslations("home.pillars");

  const pillars = [
    {
      Icon: BookIcon,
      title: t("reader.title"),
      description: t("reader.description"),
    },
    {
      Icon: TrophyIcon,
      title: t("progress.title"),
      description: t("progress.description"),
    },
    {
      Icon: SparklesIcon,
      title: t("authors.title"),
      description: t("authors.description"),
    },
  ] as const;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ul className="grid gap-5 md:grid-cols-3">
          {pillars.map(({ Icon, title, description }) => (
            <li key={title}>
              <GlassCard variant="default" className="h-full p-7">
                <div
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[color:var(--color-accent)]"
                  style={{ background: "var(--color-accent-soft)" }}
                  aria-hidden
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-[1.5rem] leading-tight text-text">
                  {title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-text-soft">
                  {description}
                </p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function FinalCta() {
  const t = await getTranslations("home.finalCta");

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <GlassCard
          variant="tinted"
          className="relative overflow-hidden p-10 text-center md:p-16"
        >
          <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-tight text-text">
            {t("titlePart1")}{" "}
            <span className="text-[color:var(--color-accent)] italic">
              {t("titlePart2")}
            </span>
            {t("titlePart3")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1rem] text-text-soft md:text-[1.1rem]">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GlassButton asChild variant="primary" size="lg">
              <Link href="/login?mode=signup">
                {t("primary")}
                <ArrowRightIcon size={14} />
              </Link>
            </GlassButton>
            <GlassButton asChild variant="outline" size="lg">
              <Link href="/login?mode=join">{t("secondary")}</Link>
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
