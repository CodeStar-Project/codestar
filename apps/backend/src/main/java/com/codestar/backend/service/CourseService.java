package com.codestar.backend.service;

import com.codestar.backend.dto.course.*;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.model.CourseStatus;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.ICourseBlockRepository;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.security.CoursePermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private static final Set<String> ALLOWED_LEVELS = Set.of("BEGINNER", "INTERMEDIATE", "ADVANCED");
    private static final Set<String> ALLOWED_BLOCK_KINDS = EnumSet.allOf(CourseBlockType.class)
            .stream().map(Enum::name).collect(Collectors.toUnmodifiableSet());

    private final ICourseRepository courseRepository;
    private final ICourseBlockRepository blockRepository;
    private final IUserRepository userRepository;
    private final CoursePermissionService coursePermissions;

    public CourseService(ICourseRepository courseRepository, ICourseBlockRepository blockRepository, IUserRepository userRepository, CoursePermissionService coursePermissions) {
        this.courseRepository = courseRepository;
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
        this.coursePermissions = coursePermissions;
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getAllPublishedCourses() {
        return courseRepository.findByStatus(CourseStatus.PUBLISHED)
                .stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getCoursesAuthoredBy(UUID authorId) {
        return courseRepository.findByAuthorId(authorId)
                .stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    public List<CourseBlockDto> getBlocks(UUID courseId, AuthenticatedUser principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));
        if (!coursePermissions.canReadCourse(principal, course)) {
            throw ApiException.notFound("Course not found: " + courseId);
        }
        return blockRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::toBlockDto)
                .collect(Collectors.toList());
    }

    public CourseDto getCourseBySlug(String slug, AuthenticatedUser principal) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + slug));
        if (!coursePermissions.canReadCourse(principal, course)) {
            throw ApiException.notFound("Course not found: " + slug);
        }
        return toDto(course);
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequestDto request, UUID authorId) {
        if (courseRepository.existsBySlug(request.getSlug())) {
            throw ApiException.conflict("Slug already used: " + request.getSlug());
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> ApiException.unauthorized("User not found"));

        String level = request.getLevel() != null ? request.getLevel() : "BEGINNER";
        if (!ALLOWED_LEVELS.contains(level)) {
            throw ApiException.badRequest("Invalid level: " + level);
        }

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setLevel(level);
        course.setAuthor(author);
        course.setStatus(CourseStatus.DRAFT);

        return toDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto updateCourse(UUID id, UpdateCourseRequestDto request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + id));

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getCategory() != null) course.setCategory(request.getCategory());
        if (request.getLevel() != null) {
            if (!ALLOWED_LEVELS.contains(request.getLevel())) {
                throw ApiException.badRequest("Invalid level: " + request.getLevel());
            }
            course.setLevel(request.getLevel());
        }

        return toDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto changeStatus(UUID id, String newStatusRaw) {
        CourseStatus newStatus = parseStatus(newStatusRaw);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + id));

        if (newStatus == course.getStatus()) {
            return toDto(course);
        }

        switch (newStatus) {
            case PUBLISHED -> {
                course.setStatus(CourseStatus.PUBLISHED);
                if (course.getPublishedAt() == null) {
                    course.setPublishedAt(OffsetDateTime.now());
                }
            }
            case DRAFT -> {
                course.setStatus(CourseStatus.DRAFT);
                course.setPublishedAt(null);
            }
            case ARCHIVED -> {
                course.setStatus(CourseStatus.ARCHIVED);
                // keep publishedAt as historical marker
            }
        }

        return toDto(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw ApiException.notFound("Course not found: " + id);
        }
        courseRepository.deleteById(id);
    }

    @Transactional
    public List<CourseBlockDto> saveBlocks(UUID courseId, SaveBlocksRequestDto request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));

        if (request.getBlocks() == null || request.getBlocks().isEmpty()) {
            throw ApiException.badRequest("blocks is required");
        }
        List<SaveBlocksRequestDto.BlockInput> inputs = request.getBlocks();
        for (SaveBlocksRequestDto.BlockInput input : inputs) {
            if (input.getKind() == null || !ALLOWED_BLOCK_KINDS.contains(input.getKind())) {
                throw ApiException.badRequest("Invalid block kind: " + input.getKind());
            }
        }

        blockRepository.deleteByCourseId(courseId);

        List<CourseBlock> newBlocks = new java.util.ArrayList<>(inputs.size());
        for (int i = 0; i < inputs.size(); i++) {
            SaveBlocksRequestDto.BlockInput input = inputs.get(i);
            CourseBlock block = new CourseBlock();
            block.setCourse(course);
            block.setKind(input.getKind());
            block.setOrderIndex(i);
            block.setPayload(input.getPayload());
            newBlocks.add(block);
        }

        blockRepository.saveAll(newBlocks);

        return newBlocks.stream()
                .map(this::toBlockDto)
                .collect(Collectors.toList());
    }

    // helpers

    private static CourseStatus parseStatus(String raw) {
        if (raw == null) throw ApiException.badRequest("status is required");
        try {
            return CourseStatus.valueOf(raw);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid status: " + raw);
        }
    }

    private CourseDto toDto(Course course) {
        List<CourseBlockDto> blocks = course.getBlocks()
                .stream()
                .map(this::toBlockDto)
                .collect(Collectors.toList());

        return new CourseDto(
                course.getId(),
                course.getSlug(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getLevel(),
                course.getStatus() != null ? course.getStatus().name() : null,
                course.getAuthor() != null ? course.getAuthor().getDisplayName() : null,
                course.getCreatedAt(),
                course.getUpdatedAt(),
                course.getPublishedAt(),
                blocks
        );
    }

    private static CourseSummaryDto toSummaryDto(Course c) {
        return new CourseSummaryDto(
                c.getId(),
                c.getSlug(),
                c.getTitle(),
                c.getDescription(),
                c.getCategory(),
                c.getLevel(),
                c.getStatus() != null ? c.getStatus().name() : null,
                c.getAuthor() != null ? c.getAuthor().getDisplayName() : null,
                c.getCreatedAt(),
                c.getUpdatedAt(),
                c.getPublishedAt()
        );
    }

    private CourseBlockDto toBlockDto(CourseBlock block) {
        return new CourseBlockDto(
                block.getId(),
                block.getKind(),
                block.getOrderIndex(),
                block.getPayload()
        );
    }
}
