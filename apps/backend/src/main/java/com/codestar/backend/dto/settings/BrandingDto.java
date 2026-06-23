package com.codestar.backend.dto.settings;

/**
 * Instance branding — persisted as a JSON blob in app_settings.
 */
public record BrandingDto(
        String name,
        String tagline,
        LogoDto logo,
        String accent,
        String heroTitle,
        String heroSubtitle,
        String heroCta,
        String locale,
        String favicon,
        String metaTitle,
        String metaDescription,
        String fontPreset,
        ThemeDto theme
) {
    public record LogoDto(String kind, String value) {}

    public record ThemeDto(ThemeTokens light, ThemeTokens dark) {}

    public record ThemeTokens(
            String bgBase,
            String bgMesh1,
            String bgMesh2,
            String bgMesh3,
            String text,
            String textSoft,
            String muted,
            String success,
            String warning,
            String danger,
            String green,
            String tip
    ) {}

    public static final BrandingDto DEFAULT = new BrandingDto(
            "Codestar",
            "Open-source e-learning platform",
            new LogoDto("preset", "star"),
            "#7AA9FF",
            null,
            null,
            null,
            "en",
            null,
            null,
            null,
            "outfit-instrument",
            new ThemeDto(
                    new ThemeTokens(
                            "#f4f6fb", "#dce8ff", "#ffe4d6", "#e1f5e8",
                            "#1a1f2e", "#4a5366", "#8892a6",
                            "#5dc9a8", "#ffb672", "#ff8a95", "#7bc86c", "#ffd66b"),
                    new ThemeTokens(
                            "#0e1422", "#1a2440", "#2a1f30", "#14283a",
                            "#edf1f9", "#b6c0d6", "#7c8ba8",
                            "#5dc9a8", "#ffb672", "#ff8a95", "#7bc86c", "#ffd66b")
                        )
    );
}
