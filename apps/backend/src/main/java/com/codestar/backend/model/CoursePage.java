package com.codestar.backend.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "course_pages")
public class CoursePage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "order_index", nullable = false)
    private int orderIndex = 0;

    @Column(length = 200)
    private String title;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    private List<CourseBlock> blocks = new ArrayList<>();

    public CoursePage() {}

    public UUID getId() { return id; }
    public Course getCourse() { return course; }
    public int getOrderIndex() { return orderIndex; }
    public String getTitle() { return title; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<CourseBlock> getBlocks() { return blocks; }

    public void setCourse(Course course) { this.course = course; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public void setTitle(String title) { this.title = title; }
    
    public void setBlocks(List<CourseBlock> blocks) {
        this.blocks.clear();
        if (blocks == null) return;
        
        for (CourseBlock block : blocks) {
            block.setPage(this);
            this.blocks.add(block);
        }
    }
}
