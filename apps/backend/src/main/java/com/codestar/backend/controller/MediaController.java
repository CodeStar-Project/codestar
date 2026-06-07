package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.media.MediaUploadDto;
import com.codestar.backend.service.MediaStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaStorageService mediaStorage;

    public MediaController(MediaStorageService mediaStorage) {
        this.mediaStorage = mediaStorage;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<MediaUploadDto>> upload(@RequestParam("file") MultipartFile file) {
        String id = mediaStorage.store(file);
        MediaUploadDto dto = new MediaUploadDto(id, "/api/v1/media/" + id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Media uploaded", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> get(@PathVariable String id) {
        Resource resource = mediaStorage.load(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mediaStorage.contentTypeFor(id)))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .header(HttpHeaders.ETAG, "\"" + id + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + id + "\"")
                .body(resource);
    }
}
