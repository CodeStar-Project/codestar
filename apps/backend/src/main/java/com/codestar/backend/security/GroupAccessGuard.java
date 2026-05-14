package com.codestar.backend.security;

import com.codestar.backend.model.GroupMemberRole;
import com.codestar.backend.model.Role;
import com.codestar.backend.repository.IGroupMembershipRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Group-scoped authorization checks used from {@code @PreAuthorize} SpEL.
 * Referenced in expressions as {@code @groupGuard}.
 */
@Component("groupGuard")
public class GroupAccessGuard {

    private final IGroupMembershipRepository memberships;

    public GroupAccessGuard(IGroupMembershipRepository memberships) {
        this.memberships = memberships;
    }

    /**
     * True if the principal may manage invitations for {@code groupId}.
     * Global ADMIN / SUPER_ADMIN keep cross-group access; a TEACHER is allowed
     * only for a group where they hold the {@code TEACHER} membership role.
     */
    public boolean canManageInvitations(UUID groupId, AuthenticatedUser principal) {
        if (principal == null || groupId == null) return false;

        Role role = principal.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) return true;

        return memberships.existsByIdUserIdAndIdGroupIdAndRoleInGroup(
                principal.getId(), groupId, GroupMemberRole.TEACHER);
    }
}
