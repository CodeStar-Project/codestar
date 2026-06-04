package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.settings.SettingsDto;
import com.codestar.backend.dto.settings.UpdateSettingsRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// TODO settings controller au lieu de instance controller

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    // TODO ne pas autoriser l'accès aux profs quand il y aura la fusion avec "instance"
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<SettingsDto>> get() {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", settingsService.get()));
    }

    @PatchMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<SettingsDto>> update(@Valid @RequestBody UpdateSettingsRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Settings updated", settingsService.update(request, principal.getId())));
    }
}
