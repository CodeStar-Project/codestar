package com.codestar.backend.dto;

import jakarta.validation.constraints.Min;

import java.time.OffsetDateTime;

public class CreateInvitationRequestDto {

    @Min(value = 1, message = "maxUses must be >= 1")
    private int maxUses = 1;

    // optional, if null the code wont expires
    private OffsetDateTime expiresAt;

    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }

    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
}
