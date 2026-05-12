package com.codestar.backend.service;

import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.GroupMemberRole;
import com.codestar.backend.model.GroupMembership;
import com.codestar.backend.model.GroupMembershipId;
import com.codestar.backend.model.InvitationCode;
import com.codestar.backend.repository.IGroupMembershipRepository;
import com.codestar.backend.repository.IGroupRepository;
import com.codestar.backend.repository.IInvitationCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class InvitationService {

    private final IInvitationCodeRepository invitations;
    private final IGroupRepository groups;
    private final IGroupMembershipRepository memberships;
    private final InvitationCodeGenerator generator;

    public InvitationService(IInvitationCodeRepository invitations, IGroupRepository groups, IGroupMembershipRepository memberships, InvitationCodeGenerator generator) {
        this.invitations = invitations;
        this.groups = groups;
        this.memberships = memberships;
        this.generator = generator;
    }

    @Transactional
    public InvitationCode create(UUID groupId, int maxUses, OffsetDateTime expiresAt, UUID createdBy) {
        if (!groups.existsById(groupId)) {
            throw ApiException.notFound("Invalid group");
        }

        // Attempts until a unique code is found. Probability of collision = ~10^-18
        String code;
        do {
            code = generator.generate();
        } while (invitations.findByCode(code).isPresent());

        InvitationCode entity = new InvitationCode(code, groupId, maxUses, expiresAt, createdBy);
        return invitations.save(entity);
    }

    @Transactional
    public void revoke(UUID invitationId, UUID actorUserId) {
        InvitationCode inv = invitations.findById(invitationId).orElseThrow(() -> ApiException.notFound("Invalid invintation"));
        if (inv.getRevokedAt() != null) return;
        inv.setRevokedAt(OffsetDateTime.now());
        invitations.save(inv);
    }

    @Transactional
    public UUID consumeAndJoin(String rawCode, UUID userId) {
        String code = rawCode == null ? "" : rawCode.toUpperCase();
        InvitationCode inv = invitations.findByCode(code).orElseThrow(() -> ApiException.notFound("Invalid code"));

        if (!inv.isUsable(OffsetDateTime.now())) {
            throw ApiException.badRequest("Code expired, revoked or used up");
        }

        UUID groupId = inv.getGroupId();
        if (!memberships.existsByIdUserIdAndIdGroupId(userId, groupId)) {
            memberships.save(new GroupMembership(new GroupMembershipId(userId, groupId), GroupMemberRole.STUDENT));
        }

        inv.incrementUse();
        invitations.save(inv);
        return groupId;
    }
}
