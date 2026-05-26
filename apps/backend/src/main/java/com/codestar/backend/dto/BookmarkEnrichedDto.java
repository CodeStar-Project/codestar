package com.codestar.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Bookmark with course + block context for display.
 */
public record BookmarkEnrichedDto(
        UUID id,
        UUID courseId,
        String courseSlug,
        String courseTitle,
        UUID blockId,
        String blockKind,
        int blockOrderIndex,
        String blockPreview,
        OffsetDateTime createdAt
) {}
