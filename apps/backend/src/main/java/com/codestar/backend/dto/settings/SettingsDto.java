package com.codestar.backend.dto.settings;

public record SettingsDto(
        boolean signupOpen,
        long mediaUserQuotaMb,
        long mediaInstanceQuotaMb,
        String aiApiUrl,
        String aiModel,
        int aiMaxTokens,
        double aiTemperature,
        boolean aiApiKeySet
) {}
