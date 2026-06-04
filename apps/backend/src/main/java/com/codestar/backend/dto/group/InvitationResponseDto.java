package com.codestar.backend.dto.group;

import java.time.OffsetDateTime;
import java.util.UUID;

public record InvitationResponseDto(
        UUID id,
        String code,
        UUID groupId,
        int maxUses,
        int usedCount,
        OffsetDateTime expiresAt,
        OffsetDateTime createdAt,
        OffsetDateTime revokedAt
) {}
