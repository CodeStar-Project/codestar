"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createCourse, updateCourse } from "@/app/actions/courses";
import { GlassButton } from "@/components/ui/glass-button";
import {
  GlassField,
  GlassFieldError,
  GlassFieldHelper,
  GlassInput,
  GlassLabel,
  GlassSelect,
  GlassTextarea,
} from "@/components/ui/glass-input";
import type {
  CourseLevel,
  CourseSummary,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/lib/types";

interface Labels {
  title: string;
  titlePlaceholder: string;
  slug: string;
  slugHelper: string;
  slugPlaceholder: string;
  description: string;
  category: string;
  categoryPlaceholder: string;
  level: string;
  levelEmpty: string;
  levelBeginner: string;
  levelIntermediate: string;
  levelAdvanced: string;
  submitCreate: string;
  submitUpdate: string;
  cancel: string;
  required: string;
  errorUnknown: string;
}

interface CourseFormProps {
  course?: CourseSummary;
  labels: Labels;
  cancelHref?: string;
}

function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CourseForm({ course, labels, cancelHref = "/admin/courses" }: CourseFormProps) {
  const router = useRouter();
  const isEdit = !!course;
  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!course);
  const [description, setDescription] = useState(course?.description ?? "");
  const [category, setCategory] = useState(course?.category ?? "");
  const [level, setLevel] = useState<CourseLevel | "">(
    (course?.level as CourseLevel | null) ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched && !isEdit) setSlug(slugify(v));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!title.trim()) {
      setError(labels.required);
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && course) {
        const body: UpdateCoursePayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
          level: level || undefined,
        };
        const r = await updateCourse(course.id, body);
        if (!r.ok) {
          setError(r.error ?? labels.errorUnknown);
          return;
        }
      } else {
        const body: CreateCoursePayload = {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
          level: level || undefined,
        };
        const r = await createCourse(body);
        if (!r.ok || !r.course) {
          setError(r.error ?? labels.errorUnknown);
          return;
        }
      }
      setSaved(true);
      router.refresh();
      router.push("/admin/courses");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <GlassField>
        <GlassLabel htmlFor="title">{labels.title}</GlassLabel>
        <GlassInput
          id="title"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={labels.titlePlaceholder}
        />
      </GlassField>

      <GlassField>
        <GlassLabel htmlFor="slug">{labels.slug}</GlassLabel>
        <GlassInput
          id="slug"
          required
          disabled={isEdit}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          placeholder={labels.slugPlaceholder}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        />
        <GlassFieldHelper>{labels.slugHelper}</GlassFieldHelper>
      </GlassField>

      <GlassField>
        <GlassLabel htmlFor="description">{labels.description}</GlassLabel>
        <GlassTextarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </GlassField>

      <div className="grid gap-5 sm:grid-cols-2">
        <GlassField>
          <GlassLabel htmlFor="category">{labels.category}</GlassLabel>
          <GlassInput
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={labels.categoryPlaceholder}
          />
        </GlassField>

        <GlassField>
          <GlassLabel htmlFor="level">{labels.level}</GlassLabel>
          <GlassSelect
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevel | "")}
          >
            <option value="">{labels.levelEmpty}</option>
            <option value="BEGINNER">{labels.levelBeginner}</option>
            <option value="INTERMEDIATE">{labels.levelIntermediate}</option>
            <option value="ADVANCED">{labels.levelAdvanced}</option>
          </GlassSelect>
        </GlassField>
      </div>

      {error && <GlassFieldError>{error}</GlassFieldError>}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <GlassButton
          type="submit"
          variant="primary"
          disabled={submitting}
          loading={submitting}
        >
          {isEdit ? labels.submitUpdate : labels.submitCreate}
        </GlassButton>
        <GlassButton
          type="button"
          variant="ghost"
          onClick={() => router.push(cancelHref)}
          disabled={submitting}
        >
          {labels.cancel}
        </GlassButton>
        {saved && (
          <span
            role="status"
            aria-live="polite"
            className="text-[0.85rem] text-[color:var(--color-success)]"
          >
            ✓ {isEdit ? labels.submitUpdate : labels.submitCreate}
          </span>
        )}
      </div>
    </form>
  );
}
