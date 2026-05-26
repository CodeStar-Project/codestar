package com.codestar.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * Full curriculum replacement for a group — the request lists the courses
 * to keep, anything else is removed.
 */
public class UpdateCurriculumRequestDto {

    @NotNull
    @Size(max = 500, message = "curriculum cannot exceed 500 courses")
    private List<UUID> courseIds;

    public UpdateCurriculumRequestDto() {}

    public List<UUID> getCourseIds() { return courseIds; }
    public void setCourseIds(List<UUID> courseIds) { this.courseIds = courseIds; }
}
