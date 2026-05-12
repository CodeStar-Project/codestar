package com.codestar.backend.dto;

/**
 * branding exposed to unauthenticated customers from {@code instance.json}
 */
public record InstanceBrandingDto(
        String name,
        String tagline,
        LogoDto logo,
        String accent,
        String heroTitle,
        String heroSubtitle,
        String heroCta,
        String locale
) {
    public record LogoDto(String kind, String value) {}
}
