package com.codestar.backend.service;

import com.codestar.backend.dto.course.*;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.model.CoursePage;
import com.codestar.backend.model.CourseStatus;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.ICoursePageRepository;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.security.CoursePermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.time.OffsetDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private static final Set<String> ALLOWED_LEVELS = Set.of("BEGINNER", "INTERMEDIATE", "ADVANCED");
    private static final Set<String> ALLOWED_BLOCK_KINDS = EnumSet.allOf(CourseBlockType.class)
            .stream().map(Enum::name).collect(Collectors.toUnmodifiableSet());
    private static final int MAX_PAGES = 200;
    private static final int MAX_BLOCKS_PER_PAGE = 200;

    private final ICourseRepository courseRepository;
    private final ICoursePageRepository pageRepository;
    private final IUserRepository userRepository;
    private final CoursePermissionService coursePermissions;
    private final BlockPayloadValidator blockPayloadValidator;
    private final AuditLogger audit;

    public CourseService(ICourseRepository courseRepository, ICoursePageRepository pageRepository, IUserRepository userRepository, CoursePermissionService coursePermissions, BlockPayloadValidator blockPayloadValidator, AuditLogger audit) {
        this.courseRepository = courseRepository;
        this.pageRepository = pageRepository;
        this.userRepository = userRepository;
        this.coursePermissions = coursePermissions;
        this.blockPayloadValidator = blockPayloadValidator;
        this.audit = audit;
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
    public List<CourseSummaryDto> searchCourses(CourseSearchFilters filters, boolean includeAll) {
        Specification<Course> statusSpec;
        if (includeAll) {
            statusSpec = filters.status() == null ? null : CourseSpecifications.byStatus(parseStatus(filters.status()));
        } else {
            statusSpec = CourseSpecifications.byStatus(CourseStatus.PUBLISHED);
        }
        Specification<Course> spec = CourseSpecifications.all(
                statusSpec,
                CourseSpecifications.byCategory(filters.category()),
                CourseSpecifications.byLevel(filters.level()),
                CourseSpecifications.byAuthorId(filters.authorId()),
                CourseSpecifications.byQuery(filters.q())
        );
        return courseRepository.findAll(spec).stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    public record CourseSearchFilters(String status, String category, String level, UUID authorId, String q) {}

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getCoursesAuthoredBy(UUID authorId) {
        return courseRepository.findByAuthorId(authorId)
                .stream()
                .map(CourseService::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CoursePageDto> getPages(UUID courseId, AuthenticatedUser principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));
        if (!coursePermissions.canReadCourse(principal, course)) {
            throw ApiException.notFound("Course not found: " + courseId);
        }
        return pageRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::toPageDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseBySlug(String slug, AuthenticatedUser principal) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + slug));
        if (!coursePermissions.canReadCourse(principal, course)) {
            throw ApiException.notFound("Course not found: " + slug);
        }
        return toDto(course);
    }

    @Transactional
    public CourseDto duplicateCourse(UUID sourceId, UUID newAuthorId) {
        Course source = courseRepository.findById(sourceId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + sourceId));
        User newAuthor = userRepository.findById(newAuthorId)
                .orElseThrow(() -> ApiException.unauthorized("User not found"));

        Course copy = new Course();
        copy.setTitle(source.getTitle() + " (copy)");
        copy.setSlug(generateUniqueSlug(source.getSlug()));
        copy.setDescription(source.getDescription());
        copy.setCategory(source.getCategory());
        copy.setLevel(source.getLevel());
        copy.setAuthor(newAuthor);
        copy.setStatus(CourseStatus.DRAFT);
        Course savedCopy = courseRepository.save(copy);

        List<CoursePage> sourcePages = pageRepository.findByCourseIdOrderByOrderIndexAsc(sourceId);
        List<CoursePage> newPages = new ArrayList<>(sourcePages.size());
        for (CoursePage srcPage : sourcePages) {
            CoursePage page = new CoursePage();
            page.setCourse(savedCopy);
            page.setOrderIndex(srcPage.getOrderIndex());
            page.setTitle(srcPage.getTitle());

            List<CourseBlock> newBlocks = new ArrayList<>(srcPage.getBlocks().size());
            for (CourseBlock src : srcPage.getBlocks()) {
                CourseBlock b = new CourseBlock();
                b.setPage(page);
                b.setKind(src.getKind());
                b.setOrderIndex(src.getOrderIndex());
                b.setPayload(src.getPayload() == null ? null : new java.util.HashMap<>(src.getPayload()));
                newBlocks.add(b);
            }
            page.setBlocks(newBlocks);
            newPages.add(page);
        }
        pageRepository.saveAll(newPages); // cascades blocks

        audit.event("course.duplicate")
                .field("courseId", savedCopy.getId())
                .field("sourceId", sourceId)
                .field("authorId", newAuthorId)
                .log();
        return toDto(savedCopy);
    }

    private String generateUniqueSlug(String base) {
        String candidate = base + "-copy";
        int n = 1;
        while (courseRepository.existsBySlug(candidate)) {
            n++;
            candidate = base + "-copy-" + n;
            if (n > 100) {
                throw ApiException.conflict("Cannot generate unique slug from: " + base);
            }
        }
        return candidate;
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

        Course saved = courseRepository.save(course);
        audit.event("course.create").field("courseId", saved.getId()).field("slug", saved.getSlug()).field("authorId", authorId).log();
        return toDto(saved);
    }

    @Transactional
    public CourseDto updateCourse(UUID id, UpdateCourseRequestDto request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + id));

        if (request.getTitle() != null) 
            course.setTitle(request.getTitle());

        if (request.getDescription() != null) 
            course.setDescription(request.getDescription());

        if (request.getCategory() != null) 
            course.setCategory(request.getCategory());

        if (request.getLevel() != null) {
            if (!ALLOWED_LEVELS.contains(request.getLevel())) {
                throw ApiException.badRequest("Invalid level: " + request.getLevel());
            }
            course.setLevel(request.getLevel());
        }

        Course saved = courseRepository.save(course);
        audit.event("course.update").field("courseId", id).log();
        return toDto(saved);
    }

    @Transactional
    public CourseDto changeStatus(UUID id, String newStatusRaw) {
        CourseStatus newStatus = parseStatus(newStatusRaw);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + id));

        CourseStatus oldStatus = course.getStatus();
        if (newStatus == oldStatus) {
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

        Course saved = courseRepository.save(course);
        audit.event("course.status").field("courseId", id).field("fromStatus", oldStatus.name()).field("toStatus", newStatus.name()).log();
        return toDto(saved);
    }

    @Transactional
    public void deleteCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + id));
        if (course.getStatus() != CourseStatus.ARCHIVED) {
            course.setStatus(CourseStatus.ARCHIVED);
            courseRepository.save(course);
            audit.event("course.archive").field("courseId", id).log();
        }
    }

    @Transactional
    public List<CoursePageDto> savePages(UUID courseId, SavePagesRequestDto request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));

        List<SavePagesRequestDto.PageInput> pageInputs = request.getPages();
        if (pageInputs == null || pageInputs.isEmpty()) {
            throw ApiException.badRequest("pages is required");
        }
        if (pageInputs.size() > MAX_PAGES) {
            throw ApiException.badRequest("A course cannot exceed " + MAX_PAGES + " pages");
        }
        List<List<Map<String, Object>>> validatedByPage = new ArrayList<>(pageInputs.size());
        for (int pi = 0; pi < pageInputs.size(); pi++) {
            List<SavePagesRequestDto.BlockInput> blocks = pageInputs.get(pi).getBlocks();
            if (blocks == null) {
                throw ApiException.badRequest("Page " + pi + ": blocks is required");
            }
            if (blocks.size() > MAX_BLOCKS_PER_PAGE) {
                throw ApiException.badRequest("Page " + (pi + 1) + " exceeds the max of " + MAX_BLOCKS_PER_PAGE + " blocks per page");
            }
            List<Map<String, Object>> validated = new ArrayList<>(blocks.size());
            for (int bi = 0; bi < blocks.size(); bi++) {
                SavePagesRequestDto.BlockInput input = blocks.get(bi);
                if (input.getKind() == null || !ALLOWED_BLOCK_KINDS.contains(input.getKind())) {
                    throw ApiException.badRequest("Page " + pi + " block " + bi + ": invalid kind: " + input.getKind());
                }
                validated.add(blockPayloadValidator.validate(input.getKind(), input.getPayload(), bi));
            }
            validatedByPage.add(validated);
        }

        pageRepository.deleteByCourseId(courseId);

        List<CoursePage> savedPages = new ArrayList<>(pageInputs.size());
        for (int pi = 0; pi < pageInputs.size(); pi++) {
            SavePagesRequestDto.PageInput pageInput = pageInputs.get(pi);
            CoursePage page = new CoursePage();
            page.setCourse(course);
            page.setOrderIndex(pi);
            page.setTitle(blankToNull(pageInput.getTitle()));

            List<Map<String, Object>> validated = validatedByPage.get(pi);
            List<CourseBlock> blocks = new ArrayList<>(validated.size());
            for (int bi = 0; bi < validated.size(); bi++) {
                CourseBlock block = new CourseBlock();
                block.setPage(page);
                block.setKind(pageInput.getBlocks().get(bi).getKind());
                block.setOrderIndex(bi);
                block.setPayload(validated.get(bi));
                blocks.add(block);
            }
            page.setBlocks(blocks);
            savedPages.add(pageRepository.save(page)); // cascades blocks
        }

        audit.event("course.save_pages").field("courseId", courseId).field("pages", savedPages.size()).debug();
        return savedPages.stream().map(this::toPageDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseExportDto exportCourse(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> ApiException.notFound("Course not found: " + courseId));

        List<CourseExportDto.PageExport> pages = pageRepository
                .findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(p -> new CourseExportDto.PageExport(
                        p.getTitle(),
                        p.getBlocks().stream()
                                .map(b -> new CourseExportDto.BlockExport(b.getKind(), b.getPayload()))
                                .collect(Collectors.toList())))
                .collect(Collectors.toList());

        CourseExportDto.CourseMeta meta = new CourseExportDto.CourseMeta(
                course.getTitle(),
                course.getSlug(),
                course.getDescription(),
                course.getCategory(),
                course.getLevel());

        return new CourseExportDto(CourseExportDto.CURRENT_VERSION, meta, pages);
    }

    private record ImportPage(String title, List<CoursePayloadDto.Block> blocks) {}

    @Transactional
    public CourseDto importCourse(CoursePayloadDto request, UUID authorId) {
        CoursePayloadDto.CourseMeta meta = request.getCourse();
        if (meta == null || meta.getTitle() == null || meta.getTitle().isBlank()) {
            throw ApiException.badRequest("course.title is required");
        }
        if (request.getVersion() != null && request.getVersion() != CourseExportDto.CURRENT_VERSION) {
            throw ApiException.badRequest("Unsupported import version: " + request.getVersion() + " (expected " + CourseExportDto.CURRENT_VERSION + ")");
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> ApiException.unauthorized("User not found"));

        String level = meta.getLevel() != null ? meta.getLevel() : "BEGINNER";
        if (!ALLOWED_LEVELS.contains(level)) {
            throw ApiException.badRequest("Invalid level: " + level);
        }

        if (request.getPages() == null || request.getPages().isEmpty()) {
            throw ApiException.badRequest("pages is required");
        }
        List<ImportPage> importPages = new ArrayList<>();
        List<CoursePayloadDto.Page> pageInputs = request.getPages();
        for (int pi = 0; pi < pageInputs.size(); pi++) {
            CoursePayloadDto.Page p = pageInputs.get(pi);
            if (p.getBlocks() == null) {
                throw ApiException.badRequest("Page " + pi + ": blocks is required");
            }
            importPages.add(new ImportPage(p.getTitle(), p.getBlocks()));
        }
        if (importPages.size() > MAX_PAGES) {
            throw ApiException.badRequest("A course cannot exceed " + MAX_PAGES + " pages");
        }
        List<List<Map<String, Object>>> validatedByPage = new ArrayList<>(importPages.size());
        for (int pi = 0; pi < importPages.size(); pi++) {
            List<CoursePayloadDto.Block> blocks = importPages.get(pi).blocks();
            if (blocks.size() > MAX_BLOCKS_PER_PAGE) {
                throw ApiException.badRequest("Page " + (pi + 1) + " exceeds the max of " + MAX_BLOCKS_PER_PAGE + " blocks per page");
            }
            List<Map<String, Object>> validated = new ArrayList<>(blocks.size());
            for (int bi = 0; bi < blocks.size(); bi++) {
                CoursePayloadDto.Block input = blocks.get(bi);
                if (input.getKind() == null || !ALLOWED_BLOCK_KINDS.contains(input.getKind())) {
                    throw ApiException.badRequest("Page " + pi + " block " + bi + ": invalid kind: " + input.getKind());
                }
                validated.add(blockPayloadValidator.validate(input.getKind(), input.getPayload(), bi));
            }
            validatedByPage.add(validated);
        }

        Course course = new Course();
        course.setTitle(meta.getTitle());
        course.setSlug(resolveImportSlug(meta.getSlug(), meta.getTitle()));
        course.setDescription(meta.getDescription());
        course.setCategory(meta.getCategory());
        course.setLevel(level);
        course.setAuthor(author);
        course.setStatus(CourseStatus.DRAFT);
        Course saved = courseRepository.save(course);

        List<CoursePage> newPages = new ArrayList<>(importPages.size());
        for (int pi = 0; pi < importPages.size(); pi++) {
            ImportPage importPage = importPages.get(pi);
            CoursePage page = new CoursePage();
            page.setCourse(saved);
            page.setOrderIndex(pi);
            page.setTitle(blankToNull(importPage.title()));

            List<Map<String, Object>> validated = validatedByPage.get(pi);
            List<CourseBlock> newBlocks = new ArrayList<>(validated.size());
            for (int bi = 0; bi < validated.size(); bi++) {
                CourseBlock block = new CourseBlock();
                block.setPage(page);
                block.setKind(importPage.blocks().get(bi).getKind());
                block.setOrderIndex(bi);
                block.setPayload(validated.get(bi));
                newBlocks.add(block);
            }
            page.setBlocks(newBlocks);
            newPages.add(page);
        }
        pageRepository.saveAll(newPages); // cascades blocks

        audit.event("course.import").field("courseId", saved.getId()).field("slug", saved.getSlug()).field("pages", importPages.size()).field("authorId", authorId).log();
        return toDto(saved);
    }

    private String resolveImportSlug(String candidate, String title) {
        String base = slugify(candidate != null && !candidate.isBlank() ? candidate : title);
        if (base.isEmpty()) base = "course";
        String slug = base;
        int n = 1;
        while (courseRepository.existsBySlug(slug)) {
            n++;
            slug = base + "-" + n;
            if (n > 1000) {
                throw ApiException.conflict("Cannot generate unique slug from: " + base);
            }
        }
        return slug;
    }

    private static String slugify(String raw) {
        if (raw == null) return "";
        String s = java.text.Normalizer.normalize(raw, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(java.util.Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        return s.length() > 120 ? s.substring(0, 120).replaceAll("-+$", "") : s;
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
        List<CoursePageDto> pages = course.getPages()
                .stream()
                .map(this::toPageDto)
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
                pages
        );
    }

    private CoursePageDto toPageDto(CoursePage page) {
        List<CourseBlockDto> blocks = page.getBlocks()
                .stream()
                .map(this::toBlockDto)
                .collect(Collectors.toList());
        return new CoursePageDto(page.getId(), page.getOrderIndex(), page.getTitle(), blocks);
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
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
