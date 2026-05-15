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

    /**
     * Returns {@code true} if the principal is allowed to manage the given group:
     * - ADMIN and SUPER_ADMIN can manage any group.
     * - TEACHER can manage only groups where they hold the TEACHER membership role.
     * - All other principals (anonymous, STUDENT) are denied.
     */
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
}
