package com.codestar.backend.dto.course;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CourseSummaryDto(
        UUID id,
        String slug,
        String title,
        String description,
        String category,
        String level,
        String status,
        String authorName,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime publishedAt
) {}
