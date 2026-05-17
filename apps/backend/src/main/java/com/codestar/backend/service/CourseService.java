package com.codestar.backend.service;

import com.codestar.backend.dto.course.*;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.ICourseBlockRepository;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.repository.IUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final ICourseRepository courseRepository;
    private final ICourseBlockRepository blockRepository;
    private final IUserRepository userRepository;

    public CourseService(ICourseRepository courseRepository,
                         ICourseBlockRepository blockRepository,
                         IUserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }

    // ── Récupérer tous les cours publiés ─────────────────────────────────────
    public List<CourseDto> getAllPublishedCourses() {
        return courseRepository.findByStatus("PUBLISHED")
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Récupérer tous les cours (admin) ─────────────────────────────────────
    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ── Récupérer un cours par son slug ──────────────────────────────────────
    public CourseDto getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Cours introuvable : " + slug));
        return toDto(course);
    }

    // ── Récupérer un cours par son id ────────────────────────────────────────
    public CourseDto getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable : " + id));
        return toDto(course);
    }

    // ── Créer un cours ───────────────────────────────────────────────────────
    @Transactional
    public CourseDto createCourse(CreateCourseRequestDto request, UUID authorId) {
        if (courseRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Ce slug est déjà utilisé : " + request.getSlug());
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setLevel(request.getLevel() != null ? request.getLevel() : "BEGINNER");
        course.setAuthor(author);
        course.setStatus("DRAFT");

        return toDto(courseRepository.save(course));
    }

    // ── Modifier les métadonnées d'un cours ──────────────────────────────────
    @Transactional
    public CourseDto updateCourse(UUID id, UpdateCourseRequestDto request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable : " + id));

        if (request.getTitle() != null)       course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getCategory() != null)    course.setCategory(request.getCategory());
        if (request.getLevel() != null)       course.setLevel(request.getLevel());

        return toDto(courseRepository.save(course));
    }

    // ── Publier / dépublier un cours ─────────────────────────────────────────
    @Transactional
    public CourseDto togglePublish(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours introuvable : " + id));

        if ("PUBLISHED".equals(course.getStatus())) {
            course.setStatus("DRAFT");
            course.setPublishedAt(null);
        } else {
            course.setStatus("PUBLISHED");
            course.setPublishedAt(OffsetDateTime.now());
        }

        return toDto(courseRepository.save(course));
    }

    // ── Supprimer un cours ───────────────────────────────────────────────────
    @Transactional
    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Cours introuvable : " + id);
        }
        courseRepository.deleteById(id);
    }

    // ── Remplacer tous les blocs d'un cours ──────────────────────────────────
    // C'est cet endpoint qu'appelle le Course Builder lors d'un import JSON
    @Transactional
    public List<CourseBlockDto> saveBlocks(UUID courseId, SaveBlocksRequestDto request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable : " + courseId));

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

    private CourseBlockDto toBlockDto(CourseBlock block) {
        return new CourseBlockDto(
                block.getId(),
                block.getKind(),
                block.getOrderIndex(),
                block.getPayload()
        );
    }
}