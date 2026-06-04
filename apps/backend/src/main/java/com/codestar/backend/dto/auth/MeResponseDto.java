package com.codestar.backend.dto.auth;

import com.codestar.backend.dto.group.GroupSummaryDto;
import com.codestar.backend.model.Role;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record MeResponseDto(
        UUID id,
        String email,
        String displayName,
        Role role,
        OffsetDateTime createdAt,
        List<GroupSummaryDto> groups
) {}
