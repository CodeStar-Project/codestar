package com.codestar.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "codestar.bootstrap.super-admin")
public record BootstrapProperties(
        @DefaultValue("") String email,
        @DefaultValue("") String password,
        @DefaultValue("Super-admin") String displayName
) {}
