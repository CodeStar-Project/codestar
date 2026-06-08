package com.codestar.backend.service;

import com.codestar.backend.config.InstanceProperties;
import com.codestar.backend.dto.instance.InstanceBrandingDto;
import com.codestar.backend.dto.instance.UpdateBrandingRequestDto;
import com.codestar.backend.exception.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;


@Service
public class InstanceBrandingService {

    private static final Logger log = LoggerFactory.getLogger(InstanceBrandingService.class);

    private final String configPath;

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    private volatile InstanceBrandingDto cached;

    public InstanceBrandingService(ResourceLoader resourceLoader, ObjectMapper objectMapper, InstanceProperties instanceProperties) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
        this.configPath = instanceProperties.configPath();
    }

    @PostConstruct
    void warmCheck() {
        cached = load();
        log.info("Instance branding loaded: name='{}' accent={}", cached.name(), cached.accent());
    }

    public InstanceBrandingDto read() {
        return cached;
    }

    public synchronized InstanceBrandingDto reload() {
        cached = load();
        return cached;
    }

    public synchronized InstanceBrandingDto update(UpdateBrandingRequestDto request) {
        Path target = resolveWritableTarget();
        InstanceBrandingDto merged = merge(cached, request);

        Path tmp = null;
        try {
            tmp = Files.createTempFile(target.getParent(), "instance-", ".json.tmp");

            objectMapper.copy()
                    .enable(SerializationFeature.INDENT_OUTPUT)
                    .writeValue(tmp.toFile(), merged);

            try {
                Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException atomicUnsupported) {
                Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("Failed to write branding file '{}': {}", target, e.getMessage());
            throw ApiException.badRequest("Cannot persist branding: " + e.getMessage());
        } finally {
            if (tmp != null) {
                try {
                    Files.deleteIfExists(tmp);
                } catch (IOException cleanupFailure) {
                    log.warn("Failed to delete temp branding file '{}': {}", tmp, cleanupFailure.getMessage());
                }
            }
        }

        cached = merged;
        return cached;
    }

    private Path resolveWritableTarget() {
        if (configPath == null || configPath.isBlank()) {
            throw ApiException.badRequest("codestar.instance.config-path is not set");
        }
        if (configPath.startsWith(ResourceUtils.CLASSPATH_URL_PREFIX)) {
            throw ApiException.badRequest("Branding is read-only when loaded from classpath. Set INSTANCE_CONFIG_PATH to a file: URL.");
        }
        Resource resource = resourceLoader.getResource(configPath);
        try {
            File file = resource.getFile();
            return file.toPath().toAbsolutePath();
        } catch (IOException e) {
            throw ApiException.badRequest("Cannot resolve branding file path: " + e.getMessage());
        }
    }

    private static InstanceBrandingDto merge(InstanceBrandingDto current, UpdateBrandingRequestDto patch) {
        return new InstanceBrandingDto(
                patch.getName() != null ? patch.getName() : current.name(),
                patch.getTagline() != null ? patch.getTagline() : current.tagline(),
                patch.getLogo() != null ? patch.getLogo() : current.logo(),
                patch.getAccent() != null ? patch.getAccent() : current.accent(),
                patch.getHeroTitle() != null ? patch.getHeroTitle() : current.heroTitle(),
                patch.getHeroSubtitle() != null ? patch.getHeroSubtitle() : current.heroSubtitle(),
                patch.getHeroCta() != null ? patch.getHeroCta() : current.heroCta(),
                patch.getLocale() != null ? patch.getLocale() : current.locale());
    }

    private InstanceBrandingDto load() {
        Resource resource = resourceLoader.getResource(configPath);
        if (!resource.exists()) {
            throw new IllegalStateException(
                    "Branding file not found at '" + configPath + "'. Set codestar.instance.config-path / INSTANCE_CONFIG_PATH to a valid file.");
        }
        try (InputStream in = resource.getInputStream()) {
            InstanceBrandingDto dto = objectMapper.readValue(in, InstanceBrandingDto.class);
            if (dto == null) {
                throw new IllegalStateException("Branding file at '" + configPath + "' is empty or invalid.");
            }
            return dto;
        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to parse branding file at '" + configPath + "': " + e.getMessage(), e);
        }
    }
}
