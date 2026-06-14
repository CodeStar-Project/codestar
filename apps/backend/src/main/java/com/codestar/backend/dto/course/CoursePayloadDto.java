package com.codestar.backend.dto.course;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;


/**
 * Portable course payload
 * Used both as the /api/v1/courses/import request body and as the AI generation output
 */
public class CoursePayloadDto {

    private Integer version;

    @NotNull(message = "course is required")
    @Valid
    private CourseMeta course;

    @NotEmpty(message = "pages must not be empty")
    @Valid
    private List<Page> pages;

    public static class CourseMeta {
        private String title;
        private String slug;
        private String description;
        private String category;
        private String level;

        public String getTitle() { return title; }
        public String getSlug() { return slug; }
        public String getDescription() { return description; }
        public String getCategory() { return category; }
        public String getLevel() { return level; }

        public void setTitle(String title) { this.title = title; }
        public void setSlug(String slug) { this.slug = slug; }
        public void setDescription(String description) { this.description = description; }
        public void setCategory(String category) { this.category = category; }
        public void setLevel(String level) { this.level = level; }
    }

    public static class Page {
        private String title;

        @Valid
        private List<Block> blocks;

        public String getTitle() { return title; }
        public List<Block> getBlocks() { return blocks; }

        public void setTitle(String title) { this.title = title; }
        public void setBlocks(List<Block> blocks) { this.blocks = blocks; }
    }

    public static class Block {
        private String kind;
        private Map<String, Object> payload;

        public String getKind() { return kind; }
        public Map<String, Object> getPayload() { return payload; }

        public void setKind(String kind) { this.kind = kind; }
        public void setPayload(Map<String, Object> payload) { this.payload = payload; }
    }

    public Integer getVersion() { return version; }
    public CourseMeta getCourse() { return course; }
    public List<Page> getPages() { return pages; }

    public void setVersion(Integer version) { this.version = version; }
    public void setCourse(CourseMeta course) { this.course = course; }
    public void setPages(List<Page> pages) { this.pages = pages; }
}
