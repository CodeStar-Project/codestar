package com.codestar.backend.repository;

import com.codestar.backend.model.GroupMemberRole;
import com.codestar.backend.model.GroupMembership;
import com.codestar.backend.model.GroupMembershipId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IGroupMembershipRepository extends JpaRepository<GroupMembership, GroupMembershipId> {

    List<GroupMembership> findByIdUserId(UUID userId);

    List<GroupMembership> findByIdGroupId(UUID groupId);

    boolean existsByIdUserIdAndIdGroupId(UUID userId, UUID groupId);

    boolean existsByIdUserIdAndIdGroupIdAndRoleInGroup(UUID userId, UUID groupId, GroupMemberRole roleInGroup);
}
