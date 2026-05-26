package com.codestar.backend.dto.course;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateCourseRequestDto {

    @Size(min = 1, max = 255)
    private String title;

    @Size(max = 4000)
    private String description;

    @Size(max = 80)
    private String category;

    @Pattern(regexp = "^(BEGINNER|INTERMEDIATE|ADVANCED)$",
            message = "level must be BEGINNER, INTERMEDIATE or ADVANCED")
    private String level;

    public UpdateCourseRequestDto() {}

    public String getTitle()        { return title; }
    public String getDescription()  { return description; }
    public String getCategory()     { return category; }
    public String getLevel()        { return level; }

    public void setTitle(String title)              { this.title = title; }
    public void setDescription(String description)  { this.description = description; }
    public void setCategory(String category)        { this.category = category; }
    public void setLevel(String level)              { this.level = level; }
}
