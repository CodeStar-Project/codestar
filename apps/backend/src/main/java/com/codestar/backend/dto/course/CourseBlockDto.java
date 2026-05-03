package com.codestar.backend.dto.course;

public class CourseBlockDto {
    private CourseBlockType type;
    private String content;
    private String level;
    private String expectedAnswer;
    private String language;
    private String mediaPath;
    private String sourceUrl;

    public CourseBlockDto(CourseBlockType type, String content) {
        this.type = type;
        this.content = content;
    }

    public CourseBlockDto withLevel(String level) {
        this.level = level;
        return this;
    }

    public CourseBlockDto withExpectedAnswer(String expectedAnswer) {
        this.expectedAnswer = expectedAnswer;
        return this;
    }

    public CourseBlockDto withLanguage(String language) {
        this.language = language;
        return this;
    }

    public CourseBlockDto withMediaPath(String mediaPath) {
        this.mediaPath = mediaPath;
        return this;
    }

    public CourseBlockDto withSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
        return this;
    }

    public CourseBlockType getType() {
        return type;
    }

    public String getContent() {
        return content;
    }

    public String getLevel() {
        return level;
    }

    public String getExpectedAnswer() {
        return expectedAnswer;
    }

    public String getLanguage() {
        return language;
    }

    public String getMediaPath() {
        return mediaPath;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }
}
