package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Tracks a user's progression on a course (0..1).
 */
@Entity
@Table(name = "enrollments")
public class Enrollment {

    @EmbeddedId
    private EnrollmentId id;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal progress = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private OffsetDateTime startedAt;

    @Column(name = "last_block_id", columnDefinition = "uuid")
    private java.util.UUID lastBlockId;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "last_activity_at", nullable = false)
    private OffsetDateTime lastActivityAt = OffsetDateTime.now();

    public Enrollment() {}

    public Enrollment(EnrollmentId id) { this.id = id; }

    public EnrollmentId getId() { return id; }
    public void setId(EnrollmentId id) { this.id = id; }

    public BigDecimal getProgress() { return progress; }
    public void setProgress(BigDecimal progress) { this.progress = progress; }

    public java.util.UUID getLastBlockId() { return lastBlockId; }
    public void setLastBlockId(java.util.UUID lastBlockId) { this.lastBlockId = lastBlockId; }

    public OffsetDateTime getStartedAt() { return startedAt; }

    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }

    public OffsetDateTime getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(OffsetDateTime lastActivityAt) { this.lastActivityAt = lastActivityAt; }
}
