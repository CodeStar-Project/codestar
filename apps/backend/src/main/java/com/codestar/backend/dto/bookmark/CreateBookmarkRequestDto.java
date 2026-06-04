package com.codestar.backend.dto.bookmark;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class CreateBookmarkRequestDto {

    @NotNull
    private UUID courseId;

    @NotNull
    private UUID blockId;

    public CreateBookmarkRequestDto() {}

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public UUID getBlockId() { return blockId; }
    public void setBlockId(UUID blockId) { this.blockId = blockId; }
}
