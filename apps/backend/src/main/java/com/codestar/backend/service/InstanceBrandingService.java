package com.codestar.backend.service;

import com.codestar.backend.dto.InstanceBrandingDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStream;


@Service
public class InstanceBrandingService {

    private static final Logger log = LoggerFactory.getLogger(InstanceBrandingService.class);

    private static final InstanceBrandingDto FALLBACK = new InstanceBrandingDto(
            "Codestar",
            "Open-source e-learning platform",
            new InstanceBrandingDto.LogoDto("preset", "star"),
            "#7AA9FF",
            null, null, null,
            "en");

    @Value("${codestar.instance.config-path}")
    private String configPath;

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    private volatile InstanceBrandingDto cached;

    public InstanceBrandingService(ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void warmCheck() {
        cached = load();
        log.info("Instance branding loaded: name='{}' accent={}", cached.name(), cached.accent());
    }

    public InstanceBrandingDto read() {
        return cached;
    }

    /** Re-reads the branding file and replaces the cache */
    public InstanceBrandingDto reload() {
        cached = load();
        return cached;
    }

    private InstanceBrandingDto load() {
        Resource resource = resourceLoader.getResource(configPath);
        if (!resource.exists()) {
            log.warn("The branding file not found at '{}', using fallback defaults", configPath);
            return FALLBACK;
        }
        try (InputStream in = resource.getInputStream()) {
            return objectMapper.readValue(in, InstanceBrandingDto.class);
        } catch (Exception e) {
            log.error("Failed to parse the branding file at '{}': {}. Fallback in use.", configPath, e.getMessage());
            return FALLBACK;
        }
    }

    // TODO Can modify the branding (endpoint PUT /api/v1/instance/branding (super-admin) qui réécrit fichier)
}
