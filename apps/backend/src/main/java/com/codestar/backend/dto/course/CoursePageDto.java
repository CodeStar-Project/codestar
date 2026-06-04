package com.codestar.backend.dto.course;

import java.util.List;
import java.util.UUID;

public record CoursePageDto(
    UUID id,
    int orderIndex,
    String title,
    List<CourseBlockDto> blocks
) {}
