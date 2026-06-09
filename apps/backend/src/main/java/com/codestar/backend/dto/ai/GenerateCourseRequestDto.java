package com.codestar.backend.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public class GenerateCourseRequestDto {

    @NotBlank(message = "topic is required")
    @Size(min = 5, max = 200, message = "topic must be between 5 and 200 characters")
    private String topic;

    @NotNull(message = "level is required")
    @Pattern(regexp = "^(BEGINNER|INTERMEDIATE|ADVANCED)$",
             message = "level must be BEGINNER, INTERMEDIATE, or ADVANCED")
    private String level;

    @Pattern(regexp = "^(fr|en)$", message = "language must be fr or en")
    private String language = "fr";

    @Size(max = 10, message = "keyIdeas must not exceed 10 items")
    private List<@Size(max = 100, message = "each key idea must not exceed 100 characters") String> keyIdeas;

    public String getTopic() { return topic; }
    public String getLevel() { return level; }
    public String getLanguage() { return language; }
    public List<String> getKeyIdeas() { return keyIdeas; }

    public void setTopic(String topic) { this.topic = topic; }
    public void setLevel(String level) { this.level = level; }
    public void setLanguage(String language) { this.language = language; }
    public void setKeyIdeas(List<String> keyIdeas) { this.keyIdeas = keyIdeas; }
}
