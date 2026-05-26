package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * Course assigned to a group (N:N).
 */
@Entity
@Table(name = "group_curriculum")
public class GroupCurriculum {

    @EmbeddedId
    private GroupCurriculumId id;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private OffsetDateTime addedAt;

    public GroupCurriculum() {}

    public GroupCurriculum(GroupCurriculumId id) {
        this.id = id;
    }

    public GroupCurriculumId getId() { return id; }
    public void setId(GroupCurriculumId id) { this.id = id; }

    public OffsetDateTime getAddedAt() { return addedAt; }
}
