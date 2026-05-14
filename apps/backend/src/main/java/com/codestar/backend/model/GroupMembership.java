package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * User membership/role with/in a group
 */
@Entity
@Table(name = "group_memberships")
public class GroupMembership {

    @EmbeddedId
    private GroupMembershipId id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_group", nullable = false, length = 16)
    private GroupMemberRole roleInGroup = GroupMemberRole.STUDENT;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;

    public GroupMembership() {}

    public GroupMembership(GroupMembershipId id, GroupMemberRole role) {
        this.id = id;
        this.roleInGroup = role != null ? role : GroupMemberRole.STUDENT;
    }

    public GroupMembershipId getId() { return id; }
    public void setId(GroupMembershipId id) { this.id = id; }

    public GroupMemberRole getRoleInGroup() { return roleInGroup; }
    public void setRoleInGroup(GroupMemberRole roleInGroup) { this.roleInGroup = roleInGroup; }

    public OffsetDateTime getJoinedAt() { return joinedAt; }
}
