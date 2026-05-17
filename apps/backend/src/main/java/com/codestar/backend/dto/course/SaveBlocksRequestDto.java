package com.codestar.backend.dto.course;

import java.util.List;
import java.util.Map;

public class SaveBlocksRequestDto {

    public static class BlockInput {
        private String kind;
        private int orderIndex;
        private Map<String, Object> payload;

        public BlockInput() {}

        public String getKind()                     { return kind; }
        public int getOrderIndex()                  { return orderIndex; }
        public Map<String, Object> getPayload()     { return payload; }

        public void setKind(String kind)                        { this.kind = kind; }
        public void setOrderIndex(int orderIndex)               { this.orderIndex = orderIndex; }
        public void setPayload(Map<String, Object> payload)     { this.payload = payload; }
    }

    private List<BlockInput> blocks;

    public SaveBlocksRequestDto() {}

    public List<BlockInput> getBlocks() { return blocks; }
    public void setBlocks(List<BlockInput> blocks) { this.blocks = blocks; }
}