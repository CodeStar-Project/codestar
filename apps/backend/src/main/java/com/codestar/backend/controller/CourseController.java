package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.course.*;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // ── GET /api/v1/courses ──────────────────────────────────────────────────
    // Retourne tous les cours publiés (étudiants)
    // Avec ?all=true retourne tous les cours (admin/teacher)
    @GetMapping
    public ResponseEntity<ApiResponseDto<List<CourseDto>>> getCourses(
            @RequestParam(value = "all", defaultValue = "false") boolean all,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        List<CourseDto> courses = all
                ? courseService.getAllCourses()
                : courseService.getAllPublishedCourses();

        return ResponseEntity.ok(new ApiResponseDto<>(true, "Cours récupérés", courses));
    }

    // ── GET /api/v1/courses/{slug} ───────────────────────────────────────────
    // Récupère un cours par son slug
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponseDto<CourseDto>> getCourseBySlug(@PathVariable String slug) {
        CourseDto course = courseService.getCourseBySlug(slug);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Cours récupéré", course));
    }

    // ── POST /api/v1/courses ─────────────────────────────────────────────────
    // Crée un nouveau cours (teacher+)
    @PostMapping
    public ResponseEntity<ApiResponseDto<CourseDto>> createCourse(
            @Valid @RequestBody CreateCourseRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (principal == null) throw ApiException.unauthorized("Unauthenticated");

        CourseDto course = courseService.createCourse(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Cours créé", course));
    }

    // ── PATCH /api/v1/courses/{id} ───────────────────────────────────────────
    // Modifie les métadonnées d'un cours (titre, description, catégorie, niveau)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponseDto<CourseDto>> updateCourse(
            @PathVariable UUID id,
            @RequestBody UpdateCourseRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (principal == null) throw ApiException.unauthorized("Unauthenticated");

        CourseDto course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Cours mis à jour", course));
    }

    // ── POST /api/v1/courses/{id}/publish ────────────────────────────────────
    // Publie ou dépublie un cours selon son état actuel
    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponseDto<CourseDto>> togglePublish(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (principal == null) throw ApiException.unauthorized("Unauthenticated");

        CourseDto course = courseService.togglePublish(id);
        String message = "PUBLISHED".equals(course.getStatus()) ? "Cours publié" : "Cours dépublié";
        return ResponseEntity.ok(new ApiResponseDto<>(true, message, course));
    }

    // ── DELETE /api/v1/courses/{id} ──────────────────────────────────────────
    // Supprime un cours et tous ses blocs
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteCourse(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (principal == null) throw ApiException.unauthorized("Unauthenticated");

        courseService.deleteCourse(id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Cours supprimé", null));
    }

    // ── PUT /api/v1/courses/{id}/blocks ──────────────────────────────────────
    // Remplace tous les blocs — c'est cet endpoint qu'appelle le Course Builder
    @PutMapping("/{id}/blocks")
    public ResponseEntity<ApiResponseDto<List<CourseBlockDto>>> saveBlocks(
            @PathVariable UUID id,
            @RequestBody SaveBlocksRequestDto request,
            @AuthenticationPrincipal AuthenticatedUser principal) {

        if (principal == null) throw ApiException.unauthorized("Unauthenticated");

        List<CourseBlockDto> blocks = courseService.saveBlocks(id, request);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Blocs sauvegardés", blocks));
    }
}