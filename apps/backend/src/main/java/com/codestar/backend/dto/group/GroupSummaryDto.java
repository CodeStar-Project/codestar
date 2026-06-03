package com.codestar.backend.dto.group;

import com.codestar.backend.model.GroupMemberRole;

import java.time.LocalDate;
import java.util.UUID;

public record GroupSummaryDto(
        UUID id,
        String name,
        String slug,
        LocalDate startsAt,
        LocalDate endsAt,
        GroupMemberRole roleInGroup
) {}
