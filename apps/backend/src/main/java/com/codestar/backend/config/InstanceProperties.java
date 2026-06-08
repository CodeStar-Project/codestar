package com.codestar.backend.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;


@ConfigurationProperties(prefix = "codestar.instance")
@Validated
public record InstanceProperties(
        // Path/URL to the branding instance.json file
        @NotBlank String configPath
) {}
