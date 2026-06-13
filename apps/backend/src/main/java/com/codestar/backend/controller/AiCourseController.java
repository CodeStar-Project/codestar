package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.ai.GenerateCourseRequestDto;
import com.codestar.backend.dto.ai.GenerateCourseResponseDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.AiCourseService;
import com.codestar.backend.service.AiRateLimiter;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai/courses")
public class AiCourseController {

    private final AiCourseService aiCourseService;
    private final AiRateLimiter aiRateLimiter;

    public AiCourseController(AiCourseService aiCourseService, AiRateLimiter aiRateLimiter) {
        this.aiCourseService = aiCourseService;
        this.aiRateLimiter = aiRateLimiter;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<GenerateCourseResponseDto>> generate(@Valid @RequestBody GenerateCourseRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (!aiRateLimiter.tryAcquire(principal.getId())) {
            throw ApiException.tooManyRequests("AI rate limit exceeded, please wait before generating another course");
        }

        GenerateCourseResponseDto draft = aiCourseService.generate(request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course draft generated", draft));
    }
}
