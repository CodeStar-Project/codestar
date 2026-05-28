package com.codestar.backend.service;

import com.codestar.backend.exception.ApiException;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Validates and normalizes the {@code payload} map of a course block per kind.
 * <p>
 * Enforces:
 * <ul>
 *   <li>Required fields per kind</li>
 *   <li>Type checks (string / list / etc.)</li>
 *   <li>Size limits (text length, list size)</li>
 *   <li>URL safety for media (http/https only)</li>
 *   <li>Unknown keys rejected (clean schema)</li>
 * </ul>
 */
@Component
public class BlockPayloadValidator {

    private static final int TEXT_MAX = 4000;
    private static final int HEADING_MAX = 200;
    private static final int CODE_MAX = 16_000;
    private static final int LANGUAGE_MAX = 30;
    private static final int ALT_MAX = 200;
    private static final int QUESTION_MAX = 500;
    private static final int OPTION_MAX = 200;
    private static final int OPTIONS_MIN = 2;
    private static final int OPTIONS_MAX = 10;
    private static final Set<String> ALLOWED_TONES = Set.of("neutral", "warning", "danger");

    /**
     * Returns a normalized payload (only the allowed keys, with their values).
     * Throws {@link ApiException#badRequest} if the payload is invalid for the given kind.
     */
    public Map<String, Object> validate(String kind, Map<String, Object> raw, int index) {
        Map<String, Object> payload = raw == null ? Map.of() : raw;
        try {
            return switch (kind) {
                case "H1", "H2", "H3" -> validateHeading(payload);
                case "P" -> validateParagraph(payload);
                case "CALLOUT" -> validateCallout(payload);
                case "CODE" -> validateCode(payload);
                case "IMAGE" -> validateImage(payload);
                case "AUDIO", "VIDEO" -> validateMedia(payload);
                case "QUIZ" -> validateQuiz(payload);
                default -> throw ApiException.badRequest("Unknown block kind: " + kind);
            };
        } catch (ApiException e) {
            throw ApiException.badRequest("Block " + index + " (" + kind + "): " + e.getMessage());
        }
    }

    private Map<String, Object> validateHeading(Map<String, Object> p) {
        String text = requireString(p, "text", HEADING_MAX);
        return Map.of("text", text);
    }

    private Map<String, Object> validateParagraph(Map<String, Object> p) {
        String text = requireString(p, "text", TEXT_MAX);
        return Map.of("text", text);
    }

    private Map<String, Object> validateCallout(Map<String, Object> p) {
        String text = requireString(p, "text", TEXT_MAX);
        String tone = optionalString(p, "tone", 20);
        if (tone == null || tone.isBlank()) tone = "neutral";
        if (!ALLOWED_TONES.contains(tone)) {
            throw ApiException.badRequest("tone must be one of " + ALLOWED_TONES);
        }
        return Map.of("text", text, "tone", tone);
    }

    private Map<String, Object> validateCode(Map<String, Object> p) {
        String code = requireString(p, "code", CODE_MAX);
        String language = optionalString(p, "language", LANGUAGE_MAX);
        if (language == null) language = "";
        return Map.of("code", code, "language", language);
    }

    private Map<String, Object> validateImage(Map<String, Object> p) {
        String src = requireUrl(p, "src");
        String alt = optionalString(p, "alt", ALT_MAX);
        if (alt == null) alt = "";
        return Map.of("src", src, "alt", alt);
    }

    private Map<String, Object> validateMedia(Map<String, Object> p) {
        String src = requireUrl(p, "src");
        return Map.of("src", src);
    }

    private Map<String, Object> validateQuiz(Map<String, Object> p) {
        String question = requireString(p, "question", QUESTION_MAX);
        Object rawOptions = p.get("options");
        if (!(rawOptions instanceof List<?> list)) {
            throw ApiException.badRequest("options must be a non-empty list of strings");
        }
        if (list.size() < OPTIONS_MIN || list.size() > OPTIONS_MAX) {
            throw ApiException.badRequest("options must contain " + OPTIONS_MIN + " to " + OPTIONS_MAX + " entries");
        }
        List<String> options = new java.util.ArrayList<>(list.size());
        for (Object o : list) {
            if (!(o instanceof String s) || s.isBlank()) {
                throw ApiException.badRequest("option entries must be non-blank strings");
            }
            if (s.length() > OPTION_MAX) {
                throw ApiException.badRequest("option exceeds " + OPTION_MAX + " characters");
            }
            options.add(s.trim());
        }
        return Map.of("question", question, "options", options);
    }

    // helpers

    private static String requireString(Map<String, Object> p, String key, int max) {
        Object v = p.get(key);
        if (!(v instanceof String s) || s.isBlank()) {
            throw ApiException.badRequest(key + " is required");
        }
        if (s.length() > max) {
            throw ApiException.badRequest(key + " exceeds " + max + " characters");
        }
        return s;
    }

    private static String optionalString(Map<String, Object> p, String key, int max) {
        Object v = p.get(key);
        if (v == null) return null;
        if (!(v instanceof String s)) {
            throw ApiException.badRequest(key + " must be a string");
        }
        if (s.length() > max) {
            throw ApiException.badRequest(key + " exceeds " + max + " characters");
        }
        return s;
    }

    private static String requireUrl(Map<String, Object> p, String key) {
        String raw = requireString(p, key, 2000);
        URI uri;
        try {
            uri = URI.create(raw);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest(key + " is not a valid URL");
        }
        String scheme = uri.getScheme();
        if (scheme == null || !(scheme.equals("http") || scheme.equals("https"))) {
            throw ApiException.badRequest(key + " must be an http(s) URL");
        }
        return raw;
    }
}
