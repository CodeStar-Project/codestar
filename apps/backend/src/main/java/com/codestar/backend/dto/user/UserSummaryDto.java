package com.codestar.backend.dto.user;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserSummaryDto(
        UUID id,
        String email,
        String displayName,
        String role,
        OffsetDateTime createdAt,
        OffsetDateTime disabledAt
) {}
