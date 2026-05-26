package com.codestar.backend.model;

/**
 * Lifecycle statuses for a {@link Course}.
 * Names must match the {@code courses_status_chk} CHECK constraint values.
 */
public enum CourseStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
