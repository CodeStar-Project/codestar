package com.codestar.backend.dto.course;

import java.util.List;

public class CoursePageDto {
    private int pageNumber;
    private List<CourseBlockDto> blocks;

    public CoursePageDto(int pageNumber, List<CourseBlockDto> blocks) {
        this.pageNumber = pageNumber;
        this.blocks = blocks;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public List<CourseBlockDto> getBlocks() {
        return blocks;
    }
}
