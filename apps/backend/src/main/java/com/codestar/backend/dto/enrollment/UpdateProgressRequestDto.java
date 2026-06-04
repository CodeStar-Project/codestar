package com.codestar.backend.dto.enrollment;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public class UpdateProgressRequestDto {

    @NotNull
    @DecimalMin(value = "0.00", message = "progress must be >= 0")
    @DecimalMax(value = "1.00", message = "progress must be <= 1")
    private BigDecimal progress;

    /** Optional — block where the user was last reading, used for resume. */
    private UUID lastBlockId;

    public UpdateProgressRequestDto() {}

    public BigDecimal getProgress() { return progress; }
    public void setProgress(BigDecimal progress) { this.progress = progress; }

    public UUID getLastBlockId() { return lastBlockId; }
    public void setLastBlockId(UUID lastBlockId) { this.lastBlockId = lastBlockId; }
}
