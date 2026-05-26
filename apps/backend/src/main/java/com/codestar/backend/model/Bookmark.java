package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * User-saved bookmark on a course block.
 */
@Entity
@Table(
    name = "bookmarks",
    uniqueConstraints = @UniqueConstraint(name = "bookmarks_user_block_uq", columnNames = {"user_id", "block_id"})
)
public class Bookmark {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @Column(name = "course_id", nullable = false, columnDefinition = "uuid")
    private UUID courseId;

    @Column(name = "block_id", nullable = false, columnDefinition = "uuid")
    private UUID blockId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Bookmark() {}

    public Bookmark(UUID userId, UUID courseId, UUID blockId) {
        this.userId = userId;
        this.courseId = courseId;
        this.blockId = blockId;
    }

    public UUID getId() { return id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public UUID getBlockId() { return blockId; }
    public void setBlockId(UUID blockId) { this.blockId = blockId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
