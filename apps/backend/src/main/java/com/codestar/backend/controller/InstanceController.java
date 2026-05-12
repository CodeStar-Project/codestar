package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.InstanceBrandingDto;
import com.codestar.backend.service.InstanceBrandingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO pouvoir modifier le branding

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
}
