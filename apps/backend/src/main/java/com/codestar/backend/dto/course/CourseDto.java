package com.codestar.backend.dto.course;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class CourseDto {

    private UUID id;
    private String slug;
    private String title;
    private String description;
    private String category;
    private String level;
    private String status;
    private String authorName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime publishedAt;
    private List<CoursePageDto> pages;

    public CourseDto() {}

    public CourseDto(UUID id, String slug, String title, String description,
                     String category, String level, String status, String authorName,
                     OffsetDateTime createdAt, OffsetDateTime updatedAt,
                     OffsetDateTime publishedAt, List<CoursePageDto> pages) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.description = description;
        this.category = category;
        this.level = level;
        this.status = status;
        this.authorName = authorName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.publishedAt = publishedAt;
        this.pages = pages;
    }

    public UUID getId() { return id; }
    public String getSlug() { return slug; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getLevel() { return level; }
    public String getStatus() { return status; }
    public String getAuthorName() { return authorName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public OffsetDateTime getPublishedAt() { return publishedAt; }
    public List<CoursePageDto> getPages() { return pages; }

    public void setId(UUID id) { this.id = id; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setLevel(String level) { this.level = level; }
    public void setStatus(String status) { this.status = status; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setPublishedAt(OffsetDateTime publishedAt) { this.publishedAt = publishedAt; }
    public void setPages(List<CoursePageDto> pages) { this.pages = pages; }
}