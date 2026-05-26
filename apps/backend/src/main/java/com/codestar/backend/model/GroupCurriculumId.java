package com.codestar.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Composite key of {@link GroupCurriculum} -> (group_id, course_id)
 */
@Embeddable
public class GroupCurriculumId implements Serializable {

    @Column(name = "group_id", nullable = false, columnDefinition = "uuid")
    private UUID groupId;

    @Column(name = "course_id", nullable = false, columnDefinition = "uuid")
    private UUID courseId;

    public GroupCurriculumId() {}

    public GroupCurriculumId(UUID groupId, UUID courseId) {
        this.groupId = groupId;
        this.courseId = courseId;
    }

    public UUID getGroupId() { return groupId; }
    public void setGroupId(UUID groupId) { this.groupId = groupId; }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GroupCurriculumId other)) return false;
        return Objects.equals(groupId, other.groupId) && Objects.equals(courseId, other.courseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, courseId);
    }
}
