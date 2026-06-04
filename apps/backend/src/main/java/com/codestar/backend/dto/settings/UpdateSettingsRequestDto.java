package com.codestar.backend.dto.settings;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class UpdateSettingsRequestDto {

    @Min(value = 1, message = "maxBlocksPerPage must be at least 1")
    @Max(value = 1000, message = "maxBlocksPerPage must be at most 1000")
    private Integer maxBlocksPerPage;

    public Integer getMaxBlocksPerPage() { return maxBlocksPerPage; }

    public void setMaxBlocksPerPage(Integer maxBlocksPerPage) {
        this.maxBlocksPerPage = maxBlocksPerPage;
    }
}
