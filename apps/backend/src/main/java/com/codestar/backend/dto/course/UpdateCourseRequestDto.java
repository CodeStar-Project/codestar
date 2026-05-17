package com.codestar.backend.dto.course;

public class UpdateCourseRequestDto {

    private String title;
    private String description;
    private String category;
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