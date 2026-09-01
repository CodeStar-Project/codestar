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

/**
 * Course payload SCHEMA version.
 * Must match the backend's CourseExportDto.CURRENT_VERSION.
 * Endpoint /courses/import rejects any other version value.
 */
export const COURSE_PAYLOAD_VERSION = 1;

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

export interface GenerateRequest {
  topic: string;
  level: CourseLevel;
  language: "fr" | "en";
  keyIdeas?: string[];
}

export interface AiCourseDraft {
  course: {
    title: string;
    slug: string;
    description: string;
    category: string;
    level: CourseLevel;
  };
  pages: PageInput[];
}

/**
 * Platform settings — mirrors backend SettingsDto (GET /api/v1/settings).
 * The AI API key is never returned; `aiApiKeySet` only tells whether one is configured.
 */
export interface InstanceSettings {
  signupOpen: boolean;
  mediaUserQuotaMb: number;
  mediaInstanceQuotaMb: number;
  aiApiUrl: string;
  aiModel: string;
  aiMaxTokens: number;
  aiTemperature: number;
  aiApiKeySet: boolean;
  /** Course builder: max blocks per page. */
  maxBlocksPerPage?: number;
}

/** Partial patch payload for PATCH /api/v1/settings (only changed fields). */
export interface UpdateSettingsPayload {
  maxBlocksPerPage?: number;
  signupOpen?: boolean;
  mediaUserQuotaMb?: number;
  mediaInstanceQuotaMb?: number;
  aiApiUrl?: string;
  /** Write-only: send to replace the stored key; never read back. */
  aiApiKey?: string;
  aiModel?: string;
  aiMaxTokens?: number;
  aiTemperature?: number;
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

/** One light/dark set of theme color tokens — mirrors backend ThemeTokens. */
export interface ThemeTokens {
  bgBase: string;
  bgMesh1: string;
  bgMesh2: string;
  bgMesh3: string;
  text: string;
  textSoft: string;
  muted: string;
  success: string;
  warning: string;
  danger: string;
  green: string;
  tip: string;
}

export interface BrandingTheme {
  light: ThemeTokens;
  dark: ThemeTokens;
}

/**
 * Instance branding — mirrors backend BrandingDto (GET /api/v1/settings/branding).
 * Public read (landing before login); writes are Admin+.
 */
export interface InstanceBranding {
  name: string;
  tagline: string;
  logo: { kind: string; value: string };
  accent: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroCta: string | null;
  locale: string;
  favicon: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  fontPreset: string;
  theme: BrandingTheme;
}

/** Partial patch payload for PATCH /api/v1/settings/branding (only changed fields). */
export interface UpdateBrandingPayload {
  name?: string;
  tagline?: string;
  logo?: { kind: string; value: string };
  accent?: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroCta?: string | null;
  locale?: string;
  favicon?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  fontPreset?: string;
  theme?: BrandingTheme;
}
