package com.codestar.backend.dto.course;

import java.util.List;
import java.util.UUID;

public class CoursePageDto {

    private UUID id;
    private int orderIndex;
    private String title;
    private List<CourseBlockDto> blocks;

    public CoursePageDto() {}

    public CoursePageDto(UUID id, int orderIndex, String title, List<CourseBlockDto> blocks) {
        this.id = id;
        this.orderIndex = orderIndex;
        this.title = title;
        this.blocks = blocks;
    }

    public UUID getId() { return id; }
    public int getOrderIndex() { return orderIndex; }
    public String getTitle() { return title; }
    public List<CourseBlockDto> getBlocks() { return blocks; }

    public void setId(UUID id) { this.id = id; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public void setTitle(String title) { this.title = title; }
    public void setBlocks(List<CourseBlockDto> blocks) { this.blocks = blocks; }
}
