package com.codestar.backend.dto.course;

/**
 * Course block kinds.
 * Must stay in sync with DB CHECK constraint on {@code course_blocks.kind}.
 */
public enum CourseBlockType {
    H1, H2, H3, H4, H5, H6, P, CODE, CALLOUT, QUOTE, IMAGE, TABLE, QUIZ, SANDBOX;

    public static final String VALIDATION_PATTERN = "^(H1|H2|H3|H4|H5|H6|P|CODE|CALLOUT|QUOTE|IMAGE|TABLE|QUIZ|SANDBOX)$";
}
