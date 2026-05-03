package com.codestar.backend.dto.course;

import java.util.List;

public class CourseDto {
    private Long id;
    private String slug;
    private String title;
    private String description;
    private List<CoursePageDto> pages;

    public CourseDto(Long id, String slug, String title, String description, List<CoursePageDto> pages) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.description = description;
        this.pages = pages;
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public List<CoursePageDto> getPages() {
        return pages;
    }
}
