-- ============================================================
-- V001 — db schema v1
-- ============================================================

-- Possible drop of the old users table
DROP TABLE IF EXISTS users CASCADE;

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
        CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'))
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
