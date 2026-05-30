package com.codestar.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateUserRoleRequestDto {

    @NotBlank
    @Pattern(regexp = "^(STUDENT|TEACHER|ADMIN|SUPER_ADMIN)$", message = "role must be STUDENT, TEACHER, ADMIN or SUPER_ADMIN")
    private String role;

    public UpdateUserRoleRequestDto() {}

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
