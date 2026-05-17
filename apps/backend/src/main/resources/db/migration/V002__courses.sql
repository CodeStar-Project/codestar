-- ============================================================
-- V002 — courses schema
-- ============================================================

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

-- COURSE_BLOCKS
-- payload est un JSONB — son contenu dépend du kind du bloc
-- kinds supportés : H1, H2, H3, P, CODE, QUOTE, WARNING, ERROR, VALIDATION, GREEN, TIP, QUIZ, PAGE_BREAK
CREATE TABLE course_blocks (
                               id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
                               course_id       UUID            NOT NULL,
                               order_index     INTEGER         NOT NULL DEFAULT 0,
                               kind            VARCHAR(20)     NOT NULL,
                               payload         JSONB           NOT NULL DEFAULT '{}',
                               created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                               CONSTRAINT course_blocks_course_fk
                                   FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
                               CONSTRAINT course_blocks_kind_chk
                                   CHECK (kind IN ('H1','H2','H3','P','CODE','QUOTE','WARNING','ERROR','VALIDATION','GREEN','TIP','QUIZ','PAGE_BREAK')),
                               CONSTRAINT course_blocks_order_chk
                                   CHECK (order_index >= 0)
);

CREATE INDEX idx_course_blocks_course       ON course_blocks (course_id);
CREATE INDEX idx_course_blocks_order        ON course_blocks (course_id, order_index);
CREATE INDEX idx_course_blocks_payload      ON course_blocks USING gin (payload);