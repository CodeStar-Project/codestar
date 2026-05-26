package com.codestar.backend.security;

import com.codestar.backend.model.InvitationCode;
import com.codestar.backend.model.Role;
import com.codestar.backend.repository.IInvitationCodeRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Permission helper for invitation actions, exposed to {@code @PreAuthorize} SpEL.
 */
@Service("invitationPermissionService")
public class InvitationPermissionService {

    private final IInvitationCodeRepository invitations;
    private final GroupPermissionService groupPermissions;

    public InvitationPermissionService(IInvitationCodeRepository invitations, GroupPermissionService groupPermissions) {
        this.invitations = invitations;
        this.groupPermissions = groupPermissions;
    }

    public boolean canRevoke(Object principal, UUID invitationId) {
        if (!(principal instanceof AuthenticatedUser user) || invitationId == null) 
            return false;

        Role role = user.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) 
            return true;

        InvitationCode inv = invitations.findById(invitationId).orElse(null);
        if (inv == null) 
            return false;

        if (user.getId().equals(inv.getCreatedBy())) 
            return true;
        return groupPermissions.canManageGroup(principal, inv.getGroupId());
    }
}
