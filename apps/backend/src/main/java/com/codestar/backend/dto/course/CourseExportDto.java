package com.codestar.backend.dto.course;

import java.util.List;
import java.util.Map;

/**
 * Versioned import/export envelope for a course (same for AI features)
 *
 * <pre>
 * { "version": 2,
 *   "course": { title, slug, description, category, level },
 *   "pages": [ { title, blocks: [ { kind, payload } ] } ] }
 * </pre>
 */
public record CourseExportDto(int version, CourseMeta course, List<PageExport> pages) {

    public static final int CURRENT_VERSION = 2;

    public record CourseMeta(
            String title,
            String slug,
            String description,
            String category,
            String level) {}

    public record PageExport(String title, List<BlockExport> blocks) {}

    public record BlockExport(String kind, Map<String, Object> payload) {}
}
