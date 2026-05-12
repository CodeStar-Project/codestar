package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Group invation code 
 * Format : {@code XXXX-XXXX-XXXX}
 * Validity : {@code revoked_at IS NULL} AND ({@code expires_at IS NULL} OR {@code expires_at > now()}) AND {@code used_count < max_uses}
 */
@Entity
@Table(name = "invitation_codes")
public class InvitationCode {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true, length = 14)
    private String code;

    @Column(name = "group_id", nullable = false, columnDefinition = "uuid")
    private UUID groupId;

    @Column(name = "max_uses", nullable = false)
    private int maxUses = 1;

    @Column(name = "used_count", nullable = false)
    private int usedCount = 0;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "created_by", nullable = false, columnDefinition = "uuid")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "revoked_at")
    private OffsetDateTime revokedAt;

    public InvitationCode() {}

    public InvitationCode(String code, UUID groupId, int maxUses, OffsetDateTime expiresAt, UUID createdBy) {
        this.code = code;
        this.groupId = groupId;
        this.maxUses = maxUses;
        this.expiresAt = expiresAt;
        this.createdBy = createdBy;
    }

    public boolean isUsable(OffsetDateTime now) {
        if (revokedAt != null) return false;
        if (expiresAt != null && !expiresAt.isAfter(now)) return false;
        return usedCount < maxUses;
    }

    public void incrementUse() {
        this.usedCount++;
    }

    public UUID getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public UUID getGroupId() { return groupId; }
    public void setGroupId(UUID groupId) { this.groupId = groupId; }

    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }

    public int getUsedCount() { return usedCount; }
    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }

    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getRevokedAt() { return revokedAt; }
    public void setRevokedAt(OffsetDateTime revokedAt) { this.revokedAt = revokedAt; }
}
