package com.codestar.backend.repository;

import com.codestar.backend.model.InvitationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IInvitationCodeRepository extends JpaRepository<InvitationCode, UUID> {

    Optional<InvitationCode> findByCode(String code);

    List<InvitationCode> findByGroupIdAndRevokedAtIsNull(UUID groupId);

    /**
     * Returns the number of rows updated (1 = consumed, 0 = no longer usable).
     */
    @Modifying
    @Query("UPDATE InvitationCode i SET i.usedCount = i.usedCount + 1 "
            + "WHERE i.id = :id AND i.revokedAt IS NULL "
            + "AND (i.expiresAt IS NULL OR i.expiresAt > :now) "
            + "AND i.usedCount < i.maxUses")
    int tryConsume(@Param("id") UUID id, @Param("now") OffsetDateTime now);
}
