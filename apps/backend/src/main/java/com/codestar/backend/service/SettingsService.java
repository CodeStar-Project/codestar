package com.codestar.backend.service;

import com.codestar.backend.config.AiProperties;
import com.codestar.backend.config.MediaProperties;
import com.codestar.backend.config.SignupProperties;
import com.codestar.backend.dto.settings.BrandingDto;
import com.codestar.backend.dto.settings.SettingsDto;
import com.codestar.backend.dto.settings.UpdateBrandingRequestDto;
import com.codestar.backend.dto.settings.UpdateSettingsRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.repository.IAppSettingRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Single source of truth for runtime-configurable settings.
 *
 * <p>An in-memory cache mirrors the table; it is warmed at boot and refreshed on every write.
 */
@Service
public class SettingsService {

    private static final Logger log = LoggerFactory.getLogger(SettingsService.class);

    static final String KEY_BRANDING = "branding";
    static final String KEY_SIGNUP_OPEN = "signup_open";
    static final String KEY_MEDIA_USER_QUOTA_MB = "media_user_quota_mb";
    static final String KEY_MEDIA_INSTANCE_QUOTA_MB = "media_instance_quota_mb";
    static final String KEY_AI_API_URL = "ai_api_url";
    static final String KEY_AI_API_KEY = "ai_api_key";
    static final String KEY_AI_MODEL = "ai_model";
    static final String KEY_AI_MAX_TOKENS = "ai_max_tokens";
    static final String KEY_AI_TEMPERATURE = "ai_temperature";

    private final IAppSettingRepository repository;
    private final AuditLogger audit;
    private final ObjectMapper objectMapper;
    private final SignupProperties signupDefaults;
    private final MediaProperties mediaDefaults;
    private final AiProperties aiDefaults;

    private final ConcurrentMap<String, String> cache = new ConcurrentHashMap<>();

    public SettingsService(IAppSettingRepository repository, AuditLogger audit, ObjectMapper objectMapper, SignupProperties signupDefaults, MediaProperties mediaDefaults, AiProperties aiDefaults) {
        this.repository = repository;
        this.audit = audit;
        this.objectMapper = objectMapper;
        this.signupDefaults = signupDefaults;
        this.mediaDefaults = mediaDefaults;
        this.aiDefaults = aiDefaults;
    }

    @PostConstruct
    void warm() {
        reload();
    }

    public synchronized void reload() {
        cache.clear();
        repository.findAll().forEach(s -> {
            if (s.getValue() != null) cache.put(s.getKey(), s.getValue());
        });
    }

    public boolean isSignupOpen() {
        String v = cache.get(KEY_SIGNUP_OPEN);
        return v == null ? signupDefaults.open() : Boolean.parseBoolean(v.trim());
    }

    public long getMediaUserQuotaMb() {
        return parseLong(KEY_MEDIA_USER_QUOTA_MB, mediaDefaults.userQuotaMb());
    }

    public long getMediaInstanceQuotaMb() {
        return parseLong(KEY_MEDIA_INSTANCE_QUOTA_MB, mediaDefaults.instanceQuotaMb());
    }

    public AiConfig getAiConfig() {
        return new AiConfig(
                str(KEY_AI_API_URL, aiDefaults.apiUrl()),
                str(KEY_AI_API_KEY, aiDefaults.apiKey()),
                str(KEY_AI_MODEL, aiDefaults.model()),
                (int) parseLong(KEY_AI_MAX_TOKENS, aiDefaults.maxTokens()),
                parseDouble(KEY_AI_TEMPERATURE, aiDefaults.temperature()));
    }

    public record AiConfig(String apiUrl, String apiKey, String model, int maxTokens, double temperature) {}

    public BrandingDto getBranding() {
        String json = cache.get(KEY_BRANDING);
        if (json == null || json.isBlank()) return BrandingDto.DEFAULT;
        try {
            BrandingDto dto = objectMapper.readValue(json, BrandingDto.class);
            return dto == null ? BrandingDto.DEFAULT : dto;
        } catch (Exception e) {
            log.warn("Invalid branding JSON in app_settings, falling back to default: {}", e.getMessage());
            return BrandingDto.DEFAULT;
        }
    }

    @Transactional(readOnly = true)
    public SettingsDto get() {
        AiConfig ai = getAiConfig();
        boolean keySet = ai.apiKey() != null && !ai.apiKey().isBlank();
        return new SettingsDto(
                isSignupOpen(),
                getMediaUserQuotaMb(),
                getMediaInstanceQuotaMb(),
                ai.apiUrl(),
                ai.model(),
                ai.maxTokens(),
                ai.temperature(),
                keySet);
    }

    @Transactional
    public SettingsDto update(UpdateSettingsRequestDto req, UUID userId) {
        if (req.getSignupOpen() != null) put(KEY_SIGNUP_OPEN, String.valueOf(req.getSignupOpen()), userId);
        if (req.getMediaUserQuotaMb() != null) put(KEY_MEDIA_USER_QUOTA_MB, String.valueOf(req.getMediaUserQuotaMb()), userId);
        if (req.getMediaInstanceQuotaMb() != null) put(KEY_MEDIA_INSTANCE_QUOTA_MB, String.valueOf(req.getMediaInstanceQuotaMb()), userId);
        if (req.getAiApiUrl() != null) put(KEY_AI_API_URL, req.getAiApiUrl().trim(), userId);
        if (req.getAiApiKey() != null && !req.getAiApiKey().isBlank()) put(KEY_AI_API_KEY, req.getAiApiKey().trim(), userId);
        if (req.getAiModel() != null) put(KEY_AI_MODEL, req.getAiModel().trim(), userId);
        if (req.getAiMaxTokens() != null) put(KEY_AI_MAX_TOKENS, String.valueOf(req.getAiMaxTokens()), userId);
        if (req.getAiTemperature() != null) put(KEY_AI_TEMPERATURE, String.valueOf(req.getAiTemperature()), userId);
        audit.event("settings.update").field("actorId", userId).log();
        return get();
    }

    @Transactional
    public BrandingDto updateBranding(UpdateBrandingRequestDto patch, UUID userId) {
        BrandingDto merged = merge(getBranding(), patch);
        try {
            put(KEY_BRANDING, objectMapper.writeValueAsString(merged), userId);
        } catch (JsonProcessingException e) {
            throw ApiException.badRequest("Cannot persist branding: " + e.getMessage());
        }
        audit.event("branding.update")
                .field("name", merged.name())
                .field("accent", merged.accent())
                .field("actorId", userId)
                .log();
        return merged;
    }

    private static BrandingDto merge(BrandingDto cur, UpdateBrandingRequestDto p) {
        return new BrandingDto(
                p.getName() != null ? p.getName() : cur.name(),
                p.getTagline() != null ? p.getTagline() : cur.tagline(),
                p.getLogo() != null ? p.getLogo() : cur.logo(),
                p.getAccent() != null ? p.getAccent() : cur.accent(),
                p.getHeroTitle() != null ? p.getHeroTitle() : cur.heroTitle(),
                p.getHeroSubtitle() != null ? p.getHeroSubtitle() : cur.heroSubtitle(),
                p.getHeroCta() != null ? p.getHeroCta() : cur.heroCta(),
                p.getLocale() != null ? p.getLocale() : cur.locale(),
                p.getFavicon() != null ? p.getFavicon() : cur.favicon(),
                p.getMetaTitle() != null ? p.getMetaTitle() : cur.metaTitle(),
                p.getMetaDescription() != null ? p.getMetaDescription() : cur.metaDescription(),
                p.getFontPreset() != null ? p.getFontPreset() : cur.fontPreset(),
                mergeTheme(cur.theme(), p.getTheme()));
    }

    private static BrandingDto.ThemeDto mergeTheme(BrandingDto.ThemeDto cur, BrandingDto.ThemeDto patch) {
        if (patch == null) return cur;
        BrandingDto.ThemeDto base = cur != null ? cur : BrandingDto.DEFAULT.theme();
        return new BrandingDto.ThemeDto(
                mergeTokens(base.light(), patch.light()),
                mergeTokens(base.dark(), patch.dark()));
    }

    private static BrandingDto.ThemeTokens mergeTokens(BrandingDto.ThemeTokens cur, BrandingDto.ThemeTokens patch) {
        if (patch == null) return cur;
        BrandingDto.ThemeTokens b = cur != null ? cur : BrandingDto.DEFAULT.theme().light();
        return new BrandingDto.ThemeTokens(
                patch.bgBase() != null ? patch.bgBase() : b.bgBase(),
                patch.bgMesh1() != null ? patch.bgMesh1() : b.bgMesh1(),
                patch.bgMesh2() != null ? patch.bgMesh2() : b.bgMesh2(),
                patch.bgMesh3() != null ? patch.bgMesh3() : b.bgMesh3(),
                patch.text() != null ? patch.text() : b.text(),
                patch.textSoft() != null ? patch.textSoft() : b.textSoft(),
                patch.muted() != null ? patch.muted() : b.muted(),
                patch.success() != null ? patch.success() : b.success(),
                patch.warning() != null ? patch.warning() : b.warning(),
                patch.danger() != null ? patch.danger() : b.danger(),
                patch.green() != null ? patch.green() : b.green(),
                patch.tip() != null ? patch.tip() : b.tip());
    }

    private void put(String key, String value, UUID userId) {
        repository.upsert(key, value, userId);
        cache.put(key, value);
    }

    private String str(String key, String def) {
        String v = cache.get(key);
        return v == null ? def : v;
    }

    private long parseLong(String key, long def) {
        String v = cache.get(key);
        if (v == null) return def;
        try {
            return Long.parseLong(v.trim());
        } catch (NumberFormatException e) {
            log.warn("Invalid numeric setting '{}'='{}', using default {}", key, v, def);
            return def;
        }
    }

    private double parseDouble(String key, double def) {
        String v = cache.get(key);
        if (v == null) return def;
        try {
            return Double.parseDouble(v.trim());
        } catch (NumberFormatException e) {
            log.warn("Invalid numeric setting '{}'='{}', using default {}", key, v, def);
            return def;
        }
    }
}
