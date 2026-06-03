package com.codestar.backend.dto.group;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record GroupResponseDto(
        UUID id,
        String name,
        String slug,
        LocalDate startsAt,
        LocalDate endsAt,
        UUID createdBy,
        OffsetDateTime createdAt
) {}
