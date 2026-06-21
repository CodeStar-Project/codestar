package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.settings.BrandingDto;
import com.codestar.backend.dto.settings.SettingsDto;
import com.codestar.backend.dto.settings.UpdateBrandingRequestDto;
import com.codestar.backend.dto.settings.UpdateSettingsRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Instance settings
 *
 * <p>Branding read is public (consumed by the landing before login); everything else is Admin+.
 */
@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/branding")
    public ResponseEntity<ApiResponseDto<BrandingDto>> branding() {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", settingsService.getBranding()));
    }

    @PatchMapping("/branding")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<BrandingDto>> updateBranding(@Valid @RequestBody UpdateBrandingRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Branding updated", settingsService.updateBranding(request, principal.getId())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
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
