package com.codestar.backend.dto.course;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public class SavePagesRequestDto {

    public static class BlockInput {

        @NotNull
        @Pattern(regexp = CourseBlockType.VALIDATION_PATTERN,
                message = "kind must be one of H1, H2, H3, H4, H5, H6, P, CODE, CALLOUT, QUOTE, IMAGE, TABLE, QUIZ, SANDBOX")
        private String kind;

        private Map<String, Object> payload;

        public BlockInput() {}

        public String getKind() { return kind; }
        public Map<String, Object> getPayload() { return payload; }

        public void setKind(String kind) { this.kind = kind; }
        public void setPayload(Map<String, Object> payload) { this.payload = payload; }
    }

    public static class PageInput {

        @Size(max = 200, message = "page title must not exceed 200 characters")
        private String title;

        @NotNull(message = "page blocks is required")
        @Valid
        private List<BlockInput> blocks;

        public PageInput() {}

        public String getTitle() { return title; }
        public List<BlockInput> getBlocks() { return blocks; }

        public void setTitle(String title) { this.title = title; }
        public void setBlocks(List<BlockInput> blocks) { this.blocks = blocks; }
    }

    @NotEmpty(message = "pages must not be empty")
    @Valid
    private List<PageInput> pages;

    public SavePagesRequestDto() {}

    public List<PageInput> getPages() { return pages; }
    public void setPages(List<PageInput> pages) { this.pages = pages; }
}
