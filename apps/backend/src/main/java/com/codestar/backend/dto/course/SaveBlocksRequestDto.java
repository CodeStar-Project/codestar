package com.codestar.backend.dto.course;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;
import java.util.Map;

public class SaveBlocksRequestDto {

    public static class BlockInput {

        @NotNull
        @Pattern(regexp = "^(H1|H2|H3|P|CODE|IMAGE|AUDIO|VIDEO|QUIZ|CALLOUT)$",
                message = "kind must be one of H1, H2, H3, P, CODE, IMAGE, AUDIO, VIDEO, QUIZ, CALLOUT")
        private String kind;

        private Map<String, Object> payload;

        public BlockInput() {}

        public String getKind()                     { return kind; }
        public Map<String, Object> getPayload()     { return payload; }

        public void setKind(String kind)                        { this.kind = kind; }
        public void setPayload(Map<String, Object> payload)     { this.payload = payload; }
    }

    @NotEmpty(message = "blocks must not be empty")
    @Valid
    private List<BlockInput> blocks;

    public SaveBlocksRequestDto() {}

    public List<BlockInput> getBlocks() { return blocks; }
    public void setBlocks(List<BlockInput> blocks) { this.blocks = blocks; }
}
