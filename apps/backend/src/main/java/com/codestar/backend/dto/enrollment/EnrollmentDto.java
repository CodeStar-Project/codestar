package com.codestar.backend.dto.enrollment;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EnrollmentDto(
        UUID userId,
        UUID courseId,
        BigDecimal progress,
        UUID lastBlockId,
        OffsetDateTime startedAt,
        OffsetDateTime completedAt,
        OffsetDateTime lastActivityAt
) {}
