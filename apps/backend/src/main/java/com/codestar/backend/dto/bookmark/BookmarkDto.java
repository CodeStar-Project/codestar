package com.codestar.backend.dto.bookmark;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BookmarkDto(
        UUID id,
        UUID userId,
        UUID courseId,
        UUID blockId,
        OffsetDateTime createdAt
) {}
