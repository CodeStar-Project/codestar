package com.codestar.backend.service;

import com.codestar.backend.dto.GroupMemberDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.GroupMemberRole;
import com.codestar.backend.model.GroupMembership;
import com.codestar.backend.model.GroupMembershipId;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.IGroupMembershipRepository;
import com.codestar.backend.repository.IGroupRepository;
import com.codestar.backend.repository.IUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupMemberService {

    private final IGroupMembershipRepository memberships;
    private final IGroupRepository groups;
    private final IUserRepository users;

    public GroupMemberService(IGroupMembershipRepository memberships, IGroupRepository groups, IUserRepository users) {
        this.memberships = memberships;
        this.groups = groups;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<GroupMemberDto> list(UUID groupId) {
        if (!groups.existsById(groupId))
            throw ApiException.notFound("Group not found: " + groupId);

        List<GroupMembership> rows = memberships.findByIdGroupId(groupId);
        if (rows.isEmpty()) return List.of();

        List<UUID> userIds = rows.stream().map(m -> m.getId().getUserId()).toList();
        java.util.Map<UUID, User> byId = users.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return rows.stream()
                .map(m -> {
                    User u = byId.get(m.getId().getUserId());
                    if (u == null) return null;
                    return new GroupMemberDto(
                            u.getId(),
                            u.getEmail(),
                            u.getDisplayName(),
                            u.getRole().name(),
                            m.getRoleInGroup().name(),
                            m.getJoinedAt(),
                            u.getDisabledAt()
                    );
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional
    public void remove(UUID groupId, UUID userId) {
        GroupMembershipId id = new GroupMembershipId(userId, groupId);
        if (!memberships.existsById(id))
            throw ApiException.notFound("Member not in group");
        
        memberships.deleteById(id);
    }

    @Transactional
    public GroupMemberDto updateRole(UUID groupId, UUID userId, String newRoleRaw) {
        GroupMemberRole newRole;
        try {
            newRole = GroupMemberRole.valueOf(newRoleRaw);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid roleInGroup: " + newRoleRaw);
        }
        GroupMembershipId id = new GroupMembershipId(userId, groupId);
        GroupMembership m = memberships.findById(id)
                .orElseThrow(() -> ApiException.notFound("Member not in group"));
        m.setRoleInGroup(newRole);
        GroupMembership saved = memberships.save(m);

        User u = users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found: " + userId));
        return new GroupMemberDto(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getRole().name(),
                saved.getRoleInGroup().name(),
                saved.getJoinedAt(),
                u.getDisabledAt()
        );
    }
}
