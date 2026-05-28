package com.codestar.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateGroupMemberRoleRequestDto {

    @NotBlank
    @Pattern(regexp = "^(STUDENT|TEACHER)$", message = "roleInGroup must be STUDENT or TEACHER")
    private String roleInGroup;

    public UpdateGroupMemberRoleRequestDto() {}

    public String getRoleInGroup() { return roleInGroup; }
    public void setRoleInGroup(String roleInGroup) { this.roleInGroup = roleInGroup; }
}
