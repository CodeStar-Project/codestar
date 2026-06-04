package com.codestar.backend.service;

import com.codestar.backend.dto.bookmark.BookmarkDto;
import com.codestar.backend.dto.bookmark.BookmarkEnrichedDto;
import com.codestar.backend.dto.bookmark.CreateBookmarkRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Bookmark;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.model.CoursePage;
import com.codestar.backend.repository.IBookmarkRepository;
import com.codestar.backend.repository.ICourseBlockRepository;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.security.CoursePermissionService;
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
    private final CoursePermissionService coursePermissions;

    public BookmarkService(IBookmarkRepository bookmarks, ICourseBlockRepository blocks, ICourseRepository courses, CoursePermissionService coursePermissions) {
        this.bookmarks = bookmarks;
        this.blocks = blocks;
        this.courses = courses;
        this.coursePermissions = coursePermissions;
    }

    @Transactional
    public BookmarkDto create(AuthenticatedUser principal, CreateBookmarkRequestDto request) {
        CourseBlock block = blocks.findById(request.getBlockId())
                .orElseThrow(() -> ApiException.notFound("Block not found"));

        CoursePage page = block.getPage();
        Course course = page != null ? page.getCourse() : null;
        if (course == null || !course.getId().equals(request.getCourseId())) {
            throw ApiException.badRequest("block does not belong to the given course");
        }

        if (!coursePermissions.canReadCourse(principal, course)) {
            throw ApiException.notFound("Course not found: " + request.getCourseId());
        }

        UUID userId = principal.getId();
        bookmarks.upsert(userId, request.getCourseId(), request.getBlockId());
        return bookmarks.findByUserIdAndBlockId(userId, request.getBlockId())
                .map(BookmarkService::toDto)
                .orElseThrow(() -> new IllegalStateException(
                        "Bookmark upsert succeeded but row not found for user=" + userId
                                + " block=" + request.getBlockId()));
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
    public List<BookmarkEnrichedDto> listMine(AuthenticatedUser principal) {
        return enrich(bookmarks.findByUserIdOrderByCreatedAtDesc(principal.getId()), principal);
    }

    @Transactional(readOnly = true)
    public List<BookmarkEnrichedDto> listMineForCourse(AuthenticatedUser principal, UUID courseId) {
        Course course = courses.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));
        if (!coursePermissions.canReadCourse(principal, course)) {
            throw ApiException.notFound("Course not found: " + courseId);
        }
        return enrich(bookmarks.findByUserIdAndCourseId(principal.getId(), courseId), principal);
    }

    // helpers

    private List<BookmarkEnrichedDto> enrich(List<Bookmark> rows, AuthenticatedUser principal) {
        if (rows.isEmpty()) return List.of();

        List<UUID> blockIds = rows.stream().map(Bookmark::getBlockId).distinct().toList();
        List<UUID> courseIds = rows.stream().map(Bookmark::getCourseId).distinct().toList();

        Map<UUID, CourseBlock> blocksById = blocks.findAllById(blockIds).stream()
                .collect(Collectors.toMap(CourseBlock::getId, Function.identity()));
        Map<UUID, Course> coursesById = courses.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity()));

        return rows.stream()
                .filter(b -> coursePermissions.canReadCourse(principal, coursesById.get(b.getCourseId())))
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
