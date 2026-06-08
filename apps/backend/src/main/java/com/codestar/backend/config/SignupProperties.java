package com.codestar.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;


@ConfigurationProperties(prefix = "codestar.signup")
public record SignupProperties(
        @DefaultValue("false") boolean open
) {}
