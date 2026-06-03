package com.codestar.backend.dto.group;

import java.time.OffsetDateTime;
import java.util.UUID;

public record GroupMemberDto(
        UUID userId,
        String email,
        String displayName,
        String globalRole,
        String roleInGroup,
        OffsetDateTime joinedAt,
        OffsetDateTime disabledAt
) {}
