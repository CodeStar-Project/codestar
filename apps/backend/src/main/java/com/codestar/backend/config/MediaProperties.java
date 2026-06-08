package com.codestar.backend.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;


@ConfigurationProperties(prefix = "codestar.media")
@Validated
public record MediaProperties(
        @NotBlank String storagePath,
        @Positive long userQuotaMb,
        @Positive long instanceQuotaMb,
        @Valid RateLimit rateLimit
) {
    public record RateLimit(
            @Positive int capacity,
            @Positive int refillPerMinute,
            @Positive long idleTtlMinutes,
            @Positive long sweepMs
    ) {}
}
