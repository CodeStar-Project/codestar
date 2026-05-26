package com.codestar.backend.security;

import com.codestar.backend.model.GroupMemberRole;
import com.codestar.backend.model.Role;
import com.codestar.backend.repository.IGroupMembershipRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Permission helper exposed to {@code @PreAuthorize} SpEL expressions.
 */
@Service("groupPermissionService")
public class GroupPermissionService {

    private final IGroupMembershipRepository memberships;

    public GroupPermissionService(IGroupMembershipRepository memberships) {
        this.memberships = memberships;
    }

    public boolean canManageGroup(Object principal, UUID groupId) {
        if (!(principal instanceof AuthenticatedUser user) || groupId == null) {
            return false;
        }
        Role role = user.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) {
            return true;
        }
        if (role == Role.TEACHER) {
            return memberships.existsByIdUserIdAndIdGroupIdAndRoleInGroup(
                    user.getId(), groupId, GroupMemberRole.TEACHER);
        }
        return false;
    }

    public boolean isGroupMember(Object principal, UUID groupId) {
        if (!(principal instanceof AuthenticatedUser user) || groupId == null) {
            return false;
        }
        Role role = user.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) {
            return true;
        }
        return memberships.existsByIdUserIdAndIdGroupId(user.getId(), groupId);
    }
}
