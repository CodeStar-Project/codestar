import { GlassChip } from "@/components/ui/glass-chip";
import { levelLabel, statusLabel } from "@/lib/format";
import type { CourseLevel, CourseStatus } from "@/lib/types";

interface CourseMetaProps {
  category?: string | null;
  level?: CourseLevel | null;
  status?: CourseStatus | null;
  locale?: "fr" | "en";
  size?: "sm" | "md";
  showStatus?: boolean;
}

const STATUS_VARIANT: Record<
  CourseStatus,
  "default" | "accent" | "success" | "warning"
> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "default",
};

export function CourseMeta({
  category,
  level,
  status,
  locale = "fr",
  size = "sm",
  showStatus = false,
}: CourseMetaProps) {
  const items: React.ReactNode[] = [];
  if (category) {
    items.push(
      <GlassChip key="cat" variant="default" size={size}>
        {category}
      </GlassChip>
    );
  }
  if (level) {
    items.push(
      <GlassChip key="lvl" variant="accent" size={size}>
        {levelLabel(level, locale)}
      </GlassChip>
    );
  }
  if (showStatus && status) {
    items.push(
      <GlassChip key="status" variant={STATUS_VARIANT[status]} size={size}>
        {statusLabel(status, locale)}
      </GlassChip>
    );
  }
  if (items.length === 0) return null;
  return <div className="flex flex-wrap items-center gap-2">{items}</div>;
}
