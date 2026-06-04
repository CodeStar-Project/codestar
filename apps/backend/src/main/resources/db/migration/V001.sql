-- ============================================================
-- V001 — db schema v1
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    display_name    VARCHAR(120)    NOT NULL,
    role            VARCHAR(32)     NOT NULL DEFAULT 'STUDENT',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    disabled_at     TIMESTAMPTZ     NULL,
    CONSTRAINT users_role_check
        CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN')),
    CONSTRAINT users_email_lowercase_chk
        CHECK (email = LOWER(email))
);

CREATE INDEX idx_users_role ON users (role);

-- GROUPS
CREATE TABLE groups (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120)    NOT NULL,
    slug        VARCHAR(80)     NOT NULL UNIQUE,
    starts_at   DATE            NULL,
    ends_at     DATE            NULL,
    created_by  UUID            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT groups_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT groups_dates_chk
        CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX idx_groups_created_by ON groups (created_by);

-- GROUP_MEMBERSHIPS - Link N:N user ↔ group + role in group (STUDENT | TEACHER)
CREATE TABLE group_memberships (
    user_id         UUID            NOT NULL,
    group_id        UUID            NOT NULL,
    role_in_group   VARCHAR(16)     NOT NULL DEFAULT 'STUDENT',
    joined_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, group_id),
    CONSTRAINT group_memberships_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT group_memberships_group_fk
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT group_memberships_role_chk
        CHECK (role_in_group IN ('STUDENT', 'TEACHER'))
);

CREATE INDEX idx_group_memberships_group ON group_memberships (group_id);

-- INVITATION_CODES
CREATE TABLE invitation_codes (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(14)     NOT NULL UNIQUE,
    group_id    UUID            NOT NULL,
    max_uses    INTEGER         NOT NULL DEFAULT 1,
    used_count  INTEGER         NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ     NULL,
    created_by  UUID            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    revoked_at  TIMESTAMPTZ     NULL,
    CONSTRAINT invitation_codes_group_fk
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT invitation_codes_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT invitation_codes_max_uses_chk
        CHECK (max_uses > 0),
    CONSTRAINT invitation_codes_used_count_chk
        CHECK (used_count >= 0 AND used_count <= max_uses),
    CONSTRAINT invitation_codes_format_chk
        CHECK (code ~ '^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$')
);

CREATE INDEX idx_invitation_codes_group ON invitation_codes (group_id);
CREATE INDEX idx_invitation_codes_active
    ON invitation_codes (group_id)
    WHERE revoked_at IS NULL;

-- COURSES
CREATE TABLE courses (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(120)    NOT NULL UNIQUE,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT            NULL,
    category        VARCHAR(80)     NULL,
    level           VARCHAR(20)     NOT NULL DEFAULT 'BEGINNER',
    author_id       UUID            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DRAFT',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ     NULL,
    CONSTRAINT courses_author_fk
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT courses_level_chk
        CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    CONSTRAINT courses_status_chk
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_courses_author    ON courses (author_id);
CREATE INDEX idx_courses_status    ON courses (status);
CREATE INDEX idx_courses_slug      ON courses (slug);

-- COURSE_PAGES — a course is an ordered list of pages, each page an ordered list of blocks
CREATE TABLE course_pages (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID            NOT NULL,
    order_index     INTEGER         NOT NULL DEFAULT 0,
    title           VARCHAR(200)    NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT course_pages_course_fk
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT course_pages_order_chk
        CHECK (order_index >= 0)
);

CREATE INDEX idx_course_pages_course ON course_pages (course_id, order_index);

-- COURSE_BLOCKS - kinds supported : H1..H6, P, CODE, CALLOUT, QUOTE, IMAGE, TABLE, QUIZ, SANDBOX
CREATE TABLE course_blocks (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id         UUID            NOT NULL,
    order_index     INTEGER         NOT NULL DEFAULT 0,
    kind            VARCHAR(20)     NOT NULL,
    payload         JSONB           NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT course_blocks_page_fk
        FOREIGN KEY (page_id) REFERENCES course_pages (id) ON DELETE CASCADE,
    CONSTRAINT course_blocks_kind_chk
        CHECK (kind IN ('H1','H2','H3','H4','H5','H6','P','CODE','CALLOUT','QUOTE','IMAGE','TABLE','QUIZ','SANDBOX')),
    CONSTRAINT course_blocks_order_chk
        CHECK (order_index >= 0)
);

CREATE INDEX idx_course_blocks_page         ON course_blocks (page_id, order_index);
CREATE INDEX idx_course_blocks_payload      ON course_blocks USING gin (payload);

-- GROUP_CURRICULUM — N:N group ↔ course (courses assigned to a group)
CREATE TABLE group_curriculum (
    group_id    UUID            NOT NULL,
    course_id   UUID            NOT NULL,
    added_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, course_id),
    CONSTRAINT group_curriculum_group_fk
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT group_curriculum_course_fk
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE INDEX idx_group_curriculum_course ON group_curriculum (course_id);

-- ENROLLMENTS — progress of a user on a course
CREATE TABLE enrollments (
    user_id         UUID            NOT NULL,
    course_id       UUID            NOT NULL,
    progress        NUMERIC(3, 2)   NOT NULL DEFAULT 0.00,
    last_block_id   UUID            NULL,
    started_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ     NULL,
    last_activity_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id),
    CONSTRAINT enrollments_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT enrollments_course_fk
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT enrollments_last_block_fk
        FOREIGN KEY (last_block_id) REFERENCES course_blocks (id) ON DELETE SET NULL,
    CONSTRAINT enrollments_progress_chk
        CHECK (progress >= 0 AND progress <= 1)
);

CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_enrollments_last_activity ON enrollments (user_id, last_activity_at DESC);

-- BOOKMARKS — user-saved / favorite blocks
CREATE TABLE bookmarks (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID            NOT NULL,
    course_id   UUID            NOT NULL,
    block_id    UUID            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT bookmarks_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_course_fk
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_block_fk
        FOREIGN KEY (block_id) REFERENCES course_blocks (id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_user_block_uq
        UNIQUE (user_id, block_id)
);

CREATE INDEX idx_bookmarks_user_course ON bookmarks (user_id, course_id);

-- APP_SETTINGS — runtime, instance-wide settings editable by ADMIN+ (key/value)
CREATE TABLE app_settings (
    key         VARCHAR(64)     PRIMARY KEY,
    value       TEXT            NOT NULL,
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_by  UUID            NULL,
    CONSTRAINT app_settings_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Default editorial limit: max blocks per course page.
INSERT INTO app_settings (key, value) VALUES ('max_blocks_per_page', '50');
