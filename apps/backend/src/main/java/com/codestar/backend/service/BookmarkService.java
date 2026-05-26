package com.codestar.backend.service;

import com.codestar.backend.dto.BookmarkDto;
import com.codestar.backend.dto.BookmarkEnrichedDto;
import com.codestar.backend.dto.CreateBookmarkRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Bookmark;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.repository.IBookmarkRepository;
import com.codestar.backend.repository.ICourseBlockRepository;
import com.codestar.backend.repository.ICourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private static final List<String> PREVIEW_KEYS = List.of("text", "title", "code", "question", "caption", "alt", "src", "url");
    private static final int PREVIEW_MAX = 120;

    private final IBookmarkRepository bookmarks;
    private final ICourseBlockRepository blocks;
    private final ICourseRepository courses;

    public BookmarkService(IBookmarkRepository bookmarks, ICourseBlockRepository blocks, ICourseRepository courses) {
        this.bookmarks = bookmarks;
        this.blocks = blocks;
        this.courses = courses;
    }

    @Transactional
    public BookmarkDto create(UUID userId, CreateBookmarkRequestDto request) {
        CourseBlock block = blocks.findById(request.getBlockId())
                .orElseThrow(() -> ApiException.notFound("Block not found"));

        if (block.getCourse() == null || !block.getCourse().getId().equals(request.getCourseId())) {
            throw ApiException.badRequest("block does not belong to the given course");
        }

        return bookmarks.findByUserIdAndBlockId(userId, request.getBlockId())
                .map(BookmarkService::toDto)
                .orElseGet(() -> toDto(bookmarks.save(
                        new Bookmark(userId, request.getCourseId(), request.getBlockId()))));
    }

    @Transactional
    public void delete(UUID userId, UUID bookmarkId) {
        Bookmark b = bookmarks.findById(bookmarkId)
                .orElseThrow(() -> ApiException.notFound("Bookmark not found"));
        if (!b.getUserId().equals(userId)) {
            throw ApiException.forbidden("Not the owner");
        }
        bookmarks.delete(b);
    }

    @Transactional(readOnly = true)
    public List<BookmarkEnrichedDto> listMine(UUID userId) {
        return enrich(bookmarks.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @Transactional(readOnly = true)
    public List<BookmarkEnrichedDto> listMineForCourse(UUID userId, UUID courseId) {
        return enrich(bookmarks.findByUserIdAndCourseId(userId, courseId));
    }

    // helpers

    private List<BookmarkEnrichedDto> enrich(List<Bookmark> rows) {
        if (rows.isEmpty()) return List.of();

        List<UUID> blockIds = rows.stream().map(Bookmark::getBlockId).distinct().toList();
        List<UUID> courseIds = rows.stream().map(Bookmark::getCourseId).distinct().toList();

        Map<UUID, CourseBlock> blocksById = blocks.findAllById(blockIds).stream()
                .collect(Collectors.toMap(CourseBlock::getId, Function.identity()));
        Map<UUID, Course> coursesById = courses.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity()));

        return rows.stream()
                .map(b -> toEnriched(b, blocksById.get(b.getBlockId()), coursesById.get(b.getCourseId())))
                .toList();
    }

    private static BookmarkEnrichedDto toEnriched(Bookmark b, CourseBlock block, Course course) {
        return new BookmarkEnrichedDto(
                b.getId(),
                b.getCourseId(),
                course != null ? course.getSlug() : null,
                course != null ? course.getTitle() : null,
                b.getBlockId(),
                block != null ? block.getKind() : null,
                block != null ? block.getOrderIndex() : -1,
                block != null ? extractPreview(block.getPayload()) : null,
                b.getCreatedAt()
        );
    }

    private static String extractPreview(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) return null;
        for (String key : PREVIEW_KEYS) {
            Object raw = payload.get(key);
            String value = stringify(raw);
            if (value != null && !value.isBlank()) {
                return truncate(value);
            }
        }
        return null;
    }

    private static String stringify(Object value) {
        if (value == null) return null;
        if (value instanceof String s) return s;
        if (value instanceof Number || value instanceof Boolean) return value.toString();
        if (value instanceof Collection<?> c && !c.isEmpty()) {
            return stringify(c.iterator().next());
        }
        return null;
    }

    private static String truncate(String s) {
        String collapsed = s.replaceAll("\\s+", " ").strip();
        return collapsed.length() <= PREVIEW_MAX ? collapsed : collapsed.substring(0, PREVIEW_MAX - 1) + "…";
    }

    private static BookmarkDto toDto(Bookmark b) {
        return new BookmarkDto(b.getId(), b.getUserId(), b.getCourseId(), b.getBlockId(), b.getCreatedAt());
    }
}
