package com.codestar.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.OffsetDateTime;

public class CreateInvitationRequestDto {

    @Min(value = 1, message = "maxUses must be >= 1")
    @Max(value = 1000, message = "maxUses must be <= 1000")
    private int maxUses = 1;

    // optional, if null the code wont expire; when set, must be in the future
    @Future(message = "expiresAt must be in the future")
    private OffsetDateTime expiresAt;

    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }

    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
}
