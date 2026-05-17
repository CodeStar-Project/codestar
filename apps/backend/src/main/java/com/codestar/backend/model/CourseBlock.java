package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "course_blocks")
public class CourseBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "order_index", nullable = false)
    private int orderIndex = 0;

    @Column(nullable = false, length = 20)
    private String kind;

    // Stocké en JSONB dans psql
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> payload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public CourseBlock() {}

    public UUID getId()                      { return id; }
    public Course getCourse()                { return course; }
    public int getOrderIndex()               { return orderIndex; }
    public String getKind()                  { return kind; }
    public Map<String, Object> getPayload()  { return payload; }
    public OffsetDateTime getCreatedAt()     { return createdAt; }

    public void setCourse(Course course)                 { this.course = course; }
    public void setOrderIndex(int orderIndex)            { this.orderIndex = orderIndex; }
    public void setKind(String kind)                     { this.kind = kind; }
    public void setPayload(Map<String, Object> payload)  { this.payload = payload; }
}