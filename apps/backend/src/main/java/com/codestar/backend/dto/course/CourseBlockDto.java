package com.codestar.backend.dto.course;

import java.util.Map;
import java.util.UUID;

public class CourseBlockDto {

    private UUID id;
    private String kind;
    private int orderIndex;
    private Map<String, Object> payload;

    public CourseBlockDto() {}

    public CourseBlockDto(UUID id, String kind, int orderIndex, Map<String, Object> payload) {
        this.id = id;
        this.kind = kind;
        this.orderIndex = orderIndex;
        this.payload = payload;
    }

    public UUID getId()                     { return id; }
    public String getKind()                 { return kind; }
    public int getOrderIndex()              { return orderIndex; }
    public Map<String, Object> getPayload() { return payload; }

    public void setId(UUID id)                              { this.id = id; }
    public void setKind(String kind)                        { this.kind = kind; }
    public void setOrderIndex(int orderIndex)               { this.orderIndex = orderIndex; }
    public void setPayload(Map<String, Object> payload)     { this.payload = payload; }
}