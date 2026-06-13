package com.codestar.backend.config;

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
        double temperature,
        @Positive int timeoutSeconds,
        @Positive int rateLimitCapacity,
        @Positive int rateLimitRefillPerMinute,
        @Positive long rateLimitIdleTtlMinutes,
        @Positive long rateLimitSweepMs
) {}
