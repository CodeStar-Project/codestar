package com.codestar.backend.service;

import com.codestar.backend.dto.course.*;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.model.Role;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.ICourseBlockRepository;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.security.AuthenticatedUser;
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
    private static final Set<String> ALLOWED_STATUSES = Set.of("DRAFT", "PUBLISHED", "ARCHIVED");
    private static final Set<String> ALLOWED_BLOCK_KINDS = EnumSet.allOf(CourseBlockType.class)
            .stream().map(Enum::name).collect(Collectors.toUnmodifiableSet());

    private final ICourseRepository courseRepository;
    private final ICourseBlockRepository blockRepository;
    private final IUserRepository userRepository;

    public CourseService(ICourseRepository courseRepository, ICourseBlockRepository blockRepository, IUserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    public List<CourseSummaryDto> getAllPublishedCourses() {
        return courseRepository.findByStatus("PUBLISHED")
                .stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    public List<CourseSummaryDto> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    public List<CourseBlockDto> getBlocks(UUID courseId, AuthenticatedUser principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));
        if (!canRead(principal, course)) {
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
        if (!canRead(principal, course)) {
            throw ApiException.notFound("Course not found: " + slug);
        }
        return toDto(course);
    }

    /**
     *  PUBLISHED courses are visible to any authenticated user
     *  DRAFT / ARCHIVED courses are visible only to their author and to ADMIN+
     */
    private static boolean canRead(AuthenticatedUser principal, Course course) {
        if ("PUBLISHED".equals(course.getStatus())) return true;
        if (principal == null) return false;

        Role role = principal.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) return true;
        return course.getAuthor() != null
                && course.getAuthor().getId().equals(principal.getId());
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
        course.setStatus("DRAFT");

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
    public CourseDto changeStatus(UUID id, String newStatus) {
        if (newStatus == null || !ALLOWED_STATUSES.contains(newStatus)) {
            throw ApiException.badRequest("Invalid status: " + newStatus);
        }
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + id));

        String current = course.getStatus();
        if (newStatus.equals(current)) {
            return toDto(course);
        }

        switch (newStatus) {
            case "PUBLISHED" -> {
                course.setStatus("PUBLISHED");
                if (course.getPublishedAt() == null) {
                    course.setPublishedAt(OffsetDateTime.now());
                }
            }
            case "DRAFT" -> {
                course.setStatus("DRAFT");
                course.setPublishedAt(null);
            }
            case "ARCHIVED" -> {
                course.setStatus("ARCHIVED");
                // keep publishedAt as historical marker
            }
            default -> throw ApiException.badRequest("Invalid status: " + newStatus);
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

        if (request.getBlocks() == null) {
            throw ApiException.badRequest("blocks is required");
        }
        for (SaveBlocksRequestDto.BlockInput input : request.getBlocks()) {
            if (input.getKind() == null || !ALLOWED_BLOCK_KINDS.contains(input.getKind())) {
                throw ApiException.badRequest("Invalid block kind: " + input.getKind());
            }
            if (input.getOrderIndex() < 0) {
                throw ApiException.badRequest("orderIndex must be >= 0");
            }
        }

        blockRepository.deleteByCourseId(courseId);

        List<CourseBlock> newBlocks = request.getBlocks()
                .stream()
                .map(input -> {
                    CourseBlock block = new CourseBlock();
                    block.setCourse(course);
                    block.setKind(input.getKind());
                    block.setOrderIndex(input.getOrderIndex());
                    block.setPayload(input.getPayload());
                    return block;
                })
                .collect(Collectors.toList());

        blockRepository.saveAll(newBlocks);

        return newBlocks.stream()
                .map(this::toBlockDto)
                .collect(Collectors.toList());
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
                course.getStatus(),
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
                c.getStatus(),
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
