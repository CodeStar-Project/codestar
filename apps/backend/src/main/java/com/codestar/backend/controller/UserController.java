package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.UpdateUserRoleRequestDto;
import com.codestar.backend.dto.UserSummaryDto;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<UserSummaryDto>>> list(@RequestParam(value = "role", required = false) String role, @RequestParam(value = "disabled", required = false) Boolean disabled, @RequestParam(value = "q", required = false) String q) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", userService.listAll(role, disabled, q)));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponseDto<UserSummaryDto>> updateRole(@PathVariable UUID id, @Valid @RequestBody UpdateUserRoleRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "User role updated", userService.updateRole(id, request.getRole(), principal)));
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<ApiResponseDto<UserSummaryDto>> disable(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "User disabled", userService.setDisabled(id, true, principal)));
    }

    @PostMapping("/{id}/enable")
    public ResponseEntity<ApiResponseDto<UserSummaryDto>> enable(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "User enabled", userService.setDisabled(id, false, principal)));
    }
}
