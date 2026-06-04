package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.instance.InstanceBrandingDto;
import com.codestar.backend.dto.instance.UpdateBrandingRequestDto;
import com.codestar.backend.service.InstanceBrandingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instance")
public class InstanceController {

    private final InstanceBrandingService brandingService;

    public InstanceController(InstanceBrandingService brandingService) {
        this.brandingService = brandingService;
    }

    @GetMapping("/branding")
    public ResponseEntity<ApiResponseDto<InstanceBrandingDto>> branding() {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", brandingService.read()));
    }

    @PatchMapping("/branding")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<InstanceBrandingDto>> updateBranding(
            @Valid @RequestBody UpdateBrandingRequestDto request) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Branding updated", brandingService.update(request)));
    }
}
