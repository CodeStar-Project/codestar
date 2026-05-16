export type Role = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN";

export type GroupMemberRole = "STUDENT" | "TEACHER";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
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

export interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
  groups: GroupSummary[];
}

export type CourseBlockType =
  | "TITLE"
  | "BLOC"
  | "CODE"
  | "WARNING"
  | "ERROR"
  | "VALIDATION"
  | "GREEN"
  | "TIP"
  | "SANDBOX"
  | "QUOTE"
  | "IMAGE"
  | "QUIZ"
  | "IFRAME"
  | "TABLE";

export interface CourseBlock {
  type: CourseBlockType;
  content: string;
  level: string | null;
  expectedAnswer: string | null;
  language: string | null;
  mediaPath: string | null;
  sourceUrl: string | null;
}

export interface CoursePage {
  pageNumber: number;
  blocks: CourseBlock[];
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  pages: CoursePage[];
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
