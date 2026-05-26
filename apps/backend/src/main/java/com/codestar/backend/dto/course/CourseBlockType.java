package com.codestar.backend.dto.course;

/**
 * Course block kinds.
 * Must stay in sync with DB CHECK constraint on {@code course_blocks.kind}.
 */
public enum CourseBlockType {
    H1, H2, H3, P, CODE, IMAGE, AUDIO, VIDEO, QUIZ, CALLOUT
}
