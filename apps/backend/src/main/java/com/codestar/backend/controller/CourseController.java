package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.course.*;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<CourseSummaryDto>>> getCourses(
            @RequestParam(value = "all", defaultValue = "false") boolean all,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "author", required = false) UUID author,
            @RequestParam(value = "q", required = false) String q,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (all && (principal == null || !(principal.getRole() == com.codestar.backend.model.Role.ADMIN || principal.getRole() == com.codestar.backend.model.Role.SUPER_ADMIN))) {
            throw ApiException.forbidden("Only ADMIN+ can list all courses");
        }

        CourseService.CourseSearchFilters filters = new CourseService.CourseSearchFilters(status, category, level, author, q);
        List<CourseSummaryDto> courses = courseService.searchCourses(filters, all);

        return ResponseEntity.ok(new ApiResponseDto<>(true, "Courses retrieved", courses));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<List<CourseSummaryDto>>> getMyCourses(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", courseService.getCoursesAuthoredBy(principal.getId())));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponseDto<CourseDto>> getCourseBySlug(@PathVariable String slug, @AuthenticationPrincipal AuthenticatedUser principal) {
        CourseDto course = courseService.getCourseBySlug(slug, principal);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course retrieved", course));
    }

    @GetMapping("/{id}/pages")
    public ResponseEntity<ApiResponseDto<List<CoursePageDto>>> getPages(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", courseService.getPages(id, principal)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<CourseDto>> createCourse(@Valid @RequestBody CreateCourseRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {

        CourseDto course = courseService.createCourse(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Course created", course));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN') and @coursePermissionService.canEditCourse(principal, #id)")
    public ResponseEntity<ApiResponseDto<CourseDto>> duplicateCourse(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        CourseDto course = courseService.duplicateCourse(id, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Course duplicated", course));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@coursePermissionService.canEditCourse(principal, #id)")
    public ResponseEntity<ApiResponseDto<CourseDto>> updateCourse(@PathVariable UUID id, @Valid @RequestBody UpdateCourseRequestDto request) {
        CourseDto course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course updated", course));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("@coursePermissionService.canEditCourse(principal, #id)")
    public ResponseEntity<ApiResponseDto<CourseDto>> changeStatus(@PathVariable UUID id, @Valid @RequestBody UpdateCourseStatusRequestDto request) {
        CourseDto course = courseService.changeStatus(id, request.getStatus());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course status updated to " + course.getStatus(), course));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@coursePermissionService.canEditCourse(principal, #id)")
    public ResponseEntity<ApiResponseDto<Void>> deleteCourse(@PathVariable UUID id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course archived", null));
    }

    @PutMapping("/{id}/pages")
    @PreAuthorize("@coursePermissionService.canEditCourse(principal, #id)")
    public ResponseEntity<ApiResponseDto<List<CoursePageDto>>> savePages(@PathVariable UUID id, @Valid @RequestBody SavePagesRequestDto request) {
        List<CoursePageDto> pages = courseService.savePages(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Pages saved", pages));
    }

    @GetMapping("/{id}/export")
    @PreAuthorize("@coursePermissionService.canEditCourse(principal, #id)")
    public ResponseEntity<ApiResponseDto<CourseExportDto>> exportCourse(@PathVariable UUID id) {
        CourseExportDto export = courseService.exportCourse(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Course exported", export));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<CourseDto>> importCourse(@Valid @RequestBody CoursePayloadDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        CourseDto course = courseService.importCourse(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Course imported", course));
    }
}
