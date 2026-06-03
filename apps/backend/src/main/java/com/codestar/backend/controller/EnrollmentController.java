package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.enrollment.EnrollmentDto;
import com.codestar.backend.dto.enrollment.UpdateProgressRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponseDto<List<EnrollmentDto>>> mine(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", enrollmentService.listMine(principal.getId())));
    }

    @PostMapping("/{courseId}/progress")
    public ResponseEntity<ApiResponseDto<EnrollmentDto>> updateProgress(
            @PathVariable UUID courseId,
            @Valid @RequestBody UpdateProgressRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        EnrollmentDto dto = enrollmentService.updateProgress(principal.getId(), courseId, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Progress updated", dto));
    }
}
