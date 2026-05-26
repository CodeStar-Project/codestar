package com.codestar.backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateCourseStatusRequestDto {

    @NotBlank
    @Pattern(regexp = "^(DRAFT|PUBLISHED|ARCHIVED)$",
            message = "status must be DRAFT, PUBLISHED or ARCHIVED")
    private String status;

    public UpdateCourseStatusRequestDto() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
