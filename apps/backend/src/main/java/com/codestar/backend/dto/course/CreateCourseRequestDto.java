package com.codestar.backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateCourseRequestDto {

    @NotBlank
    @Size(min = 1, max = 255)
    private String title;

    @NotBlank
    @Size(min = 1, max = 120)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "slug must be lowercase kebab-case (a-z, 0-9, hyphens)")
    private String slug;

    @Size(max = 4000)
    private String description;

    @Size(max = 80)
    private String category;

    @Pattern(regexp = "^(BEGINNER|INTERMEDIATE|ADVANCED)$",
            message = "level must be BEGINNER, INTERMEDIATE or ADVANCED")
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
