package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.bookmark.BookmarkDto;
import com.codestar.backend.dto.bookmark.BookmarkEnrichedDto;
import com.codestar.backend.dto.bookmark.CreateBookmarkRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.BookmarkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PostMapping
    public ResponseEntity<ApiResponseDto<BookmarkDto>> create(@Valid @RequestBody CreateBookmarkRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        BookmarkDto dto = bookmarkService.create(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Bookmark saved", dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDto<Void>> delete(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        bookmarkService.delete(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Bookmark removed", null));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponseDto<List<BookmarkEnrichedDto>>> mine(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", bookmarkService.listMine(principal)));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<BookmarkEnrichedDto>>> listForCourse(@RequestParam("courseId") UUID courseId, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK",
                bookmarkService.listMineForCourse(principal, courseId)));
    }
}
