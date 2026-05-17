package com.codestar.backend.dto.course;

public class CreateCourseRequestDto {

    private String title;
    private String slug;
    private String description;
    private String category;
    private String level;

    public CreateCourseRequestDto() {}

    public String getTitle()        { return title; }
    public String getSlug()         { return slug; }
    public String getDescription()  { return description; }
    public String getCategory()     { return category; }
    public String getLevel()        { return level; }

    public void setTitle(String title)              { this.title = title; }
    public void setSlug(String slug)                { this.slug = slug; }
    public void setDescription(String description)  { this.description = description; }
    public void setCategory(String category)        { this.category = category; }
    public void setLevel(String level)              { this.level = level; }
}