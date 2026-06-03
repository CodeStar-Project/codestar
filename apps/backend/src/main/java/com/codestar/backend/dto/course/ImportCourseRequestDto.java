package com.codestar.backend.dto.course;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;


// TODO This is also the AI-generation entry point.

public class ImportCourseRequestDto {

    private Integer version;

    @NotNull(message = "course is required")
    @Valid
    private CourseMetaInput course;

    @NotEmpty(message = "pages must not be empty")
    @Valid
    private List<PageInput> pages;

    public static class CourseMetaInput {
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

    public static class PageInput {
        private String title;

        @Valid
        private List<BlockInput> blocks;

        public String getTitle() { return title; }
        public List<BlockInput> getBlocks() { return blocks; }

        public void setTitle(String title) { this.title = title; }
        public void setBlocks(List<BlockInput> blocks) { this.blocks = blocks; }
    }

    public static class BlockInput {
        private String kind;
        private Map<String, Object> payload;

        public String getKind() { return kind; }
        public Map<String, Object> getPayload() { return payload; }

        public void setKind(String kind) { this.kind = kind; }
        public void setPayload(Map<String, Object> payload) { this.payload = payload; }
    }

    public Integer getVersion() { return version; }
    public CourseMetaInput getCourse() { return course; }
    public List<PageInput> getPages() { return pages; }

    public void setVersion(Integer version) { this.version = version; }
    public void setCourse(CourseMetaInput course) { this.course = course; }
    public void setPages(List<PageInput> pages) { this.pages = pages; }
}
