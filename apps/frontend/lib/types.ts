export type Role = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export type GroupMemberRole = "STUDENT" | "TEACHER";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface MediaUpload {
  id: string;
  url: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  slug: string;
  startsAt: string | null;
  endsAt: string | null;
  roleInGroup: GroupMemberRole;
}

export interface GroupResponse {
  id: string;
  name: string;
  slug: string;
  startsAt: string | null;
  endsAt: string | null;
  createdBy: string;
  createdAt: string;
}

export interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
  groups: GroupSummary[];
}

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CourseBlockKind =
  | "H1"
  | "H2"
  | "H3"
  | "H4"
  | "H5"
  | "H6"
  | "P"
  | "CODE"
  | "CALLOUT"
  | "QUOTE"
  | "IMAGE"
  | "TABLE"
  | "QUIZ"
  | "SANDBOX";

export type CalloutTone =
  | "neutral"
  | "warning"
  | "danger"
  | "success"
  | "green"
  | "tip";

export interface CourseBlock {
  id: string;
  kind: CourseBlockKind;
  orderIndex: number;
  payload: Record<string, unknown>;
}

export interface CoursePage {
  id: string;
  orderIndex: number;
  title: string | null;
  blocks: CourseBlock[];
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  level: CourseLevel | null;
  status: CourseStatus;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Course extends CourseSummary {
  pages: CoursePage[];
}

export interface Enrollment {
  userId: string;
  courseId: string;
  progress: string;
  lastBlockId: string | null;
  startedAt: string;
  completedAt: string | null;
  lastActivityAt: string;
}

export interface BlockInput {
  kind: CourseBlockKind;
  payload: Record<string, unknown>;
}

export interface PageInput {
  title?: string | null;
  blocks: BlockInput[];
}

export interface CourseExport {
  version: number;
  course: {
    title: string;
    slug?: string | null;
    description?: string | null;
    category?: string | null;
    level?: CourseLevel | null;
  };
  pages: PageInput[];
}

export interface InstanceSettings {
  maxBlocksPerPage: number;
}

export interface CourseMutationResult {
  ok: boolean;
  error?: string;
  course?: Course;
}

export interface CreateCoursePayload {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
}

export interface UpdateCoursePayload {
  title?: string;
  description?: string;
  category?: string;
  level?: CourseLevel;
}

export interface BookmarkEnriched {
  id: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  blockId: string;
  blockKind: CourseBlockKind;
  blockOrderIndex: number;
  blockPreview: string | null;
  createdAt: string;
}

export interface InstanceBranding {
  name: string;
  tagline: string;
  logo: { kind: string; value: string };
  accent: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroCta: string | null;
  locale: "en" | "fr";
}
