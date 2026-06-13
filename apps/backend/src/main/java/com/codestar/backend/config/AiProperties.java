package com.codestar.backend.config;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "codestar.ai")
@Validated
public record AiProperties(
        String apiUrl,
        String apiKey,
        String model,
        @Positive int maxTokens,
        @DecimalMin("0.0") @DecimalMax("2.0") double temperature,
        @Positive int connectTimeoutSeconds,
        @Positive int timeoutSeconds,
        @Positive int rateLimitCapacity,
        @Positive int rateLimitRefillPerMinute,
        @Positive long rateLimitIdleTtlMinutes,
        @Positive long rateLimitSweepMs
) {}
