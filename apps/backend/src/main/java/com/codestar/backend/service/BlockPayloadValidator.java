package com.codestar.backend.service;

import com.codestar.backend.exception.ApiException;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validates and normalizes the {@code payload} map of a course block per kind
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
    private static final int EXPLANATION_MAX = 1000;
    private static final int AUTHOR_MAX = 160;
    private static final int SOURCE_MAX = 300;
    private static final int CELL_MAX = 500;
    private static final int TABLE_COLS_MAX = 12;
    private static final int TABLE_ROWS_MAX = 100;
    private static final int EXPECTED_OUTPUT_MAX = 4000;
    private static final Set<String> ALLOWED_TONES = Set.of("neutral", "warning", "danger", "success", "green", "tip");
    private static final Pattern INTERNAL_MEDIA_PATH = Pattern.compile("^/api/v1/media/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[a-z0-9]+$");

    /**
     * Returns a normalized payload (only the allowed keys, with their values).
     */
    public Map<String, Object> validate(String kind, Map<String, Object> raw, int index) {
        Map<String, Object> payload = raw == null ? Map.of() : raw;
        try {
            return switch (kind) {
                case "H1", "H2", "H3", "H4", "H5", "H6" -> validateHeading(payload);
                case "P" -> validateParagraph(payload);
                case "CALLOUT" -> validateCallout(payload);
                case "QUOTE" -> validateQuote(payload);
                case "CODE" -> validateCode(payload);
                case "IMAGE" -> validateImage(payload);
                case "TABLE" -> validateTable(payload);
                case "QUIZ" -> validateQuiz(payload);
                case "SANDBOX" -> validateSandbox(payload);
                default -> throw ApiException.badRequest("Unknown block kind: " + kind);
            };
        } catch (ApiException e) {
            throw ApiException.badRequest("Block " + index + " (" + kind + "): " + e.getMessage());
        }
    }

    private Map<String, Object> validateHeading(Map<String, Object> p) {
        rejectUnknown(p, Set.of("text"));
        String text = requireString(p, "text", HEADING_MAX);
        return Map.of("text", text);
    }

    private Map<String, Object> validateParagraph(Map<String, Object> p) {
        rejectUnknown(p, Set.of("text"));
        String text = requireString(p, "text", TEXT_MAX);
        return Map.of("text", text);
    }

    private Map<String, Object> validateCallout(Map<String, Object> p) {
        rejectUnknown(p, Set.of("text", "tone"));
        String text = requireString(p, "text", TEXT_MAX);
        String tone = optionalString(p, "tone", 20);
        if (tone == null || tone.isBlank()) tone = "neutral";
        if (!ALLOWED_TONES.contains(tone)) {
            throw ApiException.badRequest("tone must be one of " + ALLOWED_TONES);
        }
        return Map.of("text", text, "tone", tone);
    }

    private Map<String, Object> validateCode(Map<String, Object> p) {
        rejectUnknown(p, Set.of("code", "language"));
        String code = requireString(p, "code", CODE_MAX);
        String language = optionalString(p, "language", LANGUAGE_MAX);
        if (language == null) language = "";
        return Map.of("code", code, "language", language);
    }

    private Map<String, Object> validateImage(Map<String, Object> p) {
        rejectUnknown(p, Set.of("src", "alt"));
        // src is optional because blocks are mostly added before the image is uploaded via course builder
        String src = optionalString(p, "src", 2000);
        if (src == null || src.isBlank()) {
            src = "";
        } else if (!INTERNAL_MEDIA_PATH.matcher(src).matches()) {
            src = requireHttpUrl(src);
        }
        String alt = optionalString(p, "alt", ALT_MAX);
        if (alt == null) alt = "";
        return Map.of("src", src, "alt", alt);
    }

    private Map<String, Object> validateQuote(Map<String, Object> p) {
        rejectUnknown(p, Set.of("text", "author", "source"));
        String text = requireString(p, "text", TEXT_MAX);
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("text", text);
        String author = optionalString(p, "author", AUTHOR_MAX);
        if (author != null && !author.isBlank()) out.put("author", author.trim());
        String source = optionalString(p, "source", SOURCE_MAX);
        if (source != null && !source.isBlank()) out.put("source", source.trim());
        return out;
    }

    private Map<String, Object> validateTable(Map<String, Object> p) {
        rejectUnknown(p, Set.of("header", "rows"));
        List<String> header = requireStringList(p, "header", "header");
        if (header.isEmpty() || header.size() > TABLE_COLS_MAX) {
            throw ApiException.badRequest("header must contain 1 to " + TABLE_COLS_MAX + " columns");
        }
        int cols = header.size();

        Object rawRows = p.get("rows");
        if (!(rawRows instanceof List<?> list)) {
            throw ApiException.badRequest("rows must be a list of rows");
        }
        if (list.size() > TABLE_ROWS_MAX) {
            throw ApiException.badRequest("rows must not exceed " + TABLE_ROWS_MAX + " entries");
        }
        List<List<String>> rows = new java.util.ArrayList<>(list.size());
        for (Object rawRow : list) {
            if (!(rawRow instanceof List<?> rowList)) {
                throw ApiException.badRequest("each row must be a list of cells");
            }
            if (rowList.size() != cols) {
                throw ApiException.badRequest("each row must have exactly " + cols + " cells (header width)");
            }
            List<String> row = new java.util.ArrayList<>(cols);
            for (Object cell : rowList) {
                if (!(cell instanceof String s)) {
                    throw ApiException.badRequest("table cells must be strings");
                }
                if (s.length() > CELL_MAX) {
                    throw ApiException.badRequest("table cell exceeds " + CELL_MAX + " characters");
                }
                row.add(s);
            }
            rows.add(row);
        }
        return Map.of("header", header, "rows", rows);
    }

    private Map<String, Object> validateQuiz(Map<String, Object> p) {
        rejectUnknown(p, Set.of("question", "options", "correctIndex", "explanation"));
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
        int correctIndex = requireInt(p, "correctIndex");
        if (correctIndex < 0 || correctIndex >= options.size()) {
            throw ApiException.badRequest("correctIndex must be between 0 and " + (options.size() - 1));
        }
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("question", question);
        out.put("options", options);
        out.put("correctIndex", correctIndex);
        String explanation = optionalString(p, "explanation", EXPLANATION_MAX);
        if (explanation != null && !explanation.isBlank()) out.put("explanation", explanation.trim());
        return out;
    }

    private Map<String, Object> validateSandbox(Map<String, Object> p) {
        rejectUnknown(p, Set.of("language", "code", "readonly", "expectedOutput"));
        String language = requireString(p, "language", LANGUAGE_MAX);
        String code = requireString(p, "code", CODE_MAX);
        Map<String, Object> out = new java.util.LinkedHashMap<>();
        out.put("language", language);
        out.put("code", code);
        out.put("readonly", optionalBool(p, "readonly", true));
        String expectedOutput = optionalString(p, "expectedOutput", EXPECTED_OUTPUT_MAX);
        if (expectedOutput != null && !expectedOutput.isBlank()) {
            out.put("expectedOutput", expectedOutput);
        }
        return out;
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

    /**
     * Throws badRequest if {@code p} contains any key not listed in {@code allowed}.
     */
    private static void rejectUnknown(Map<String, Object> p, Set<String> allowed) {
        for (String key : p.keySet()) {
            if (!allowed.contains(key)) {
                throw ApiException.badRequest("unknown payload key: " + key);
            }
        }
    }

    private static int requireInt(Map<String, Object> p, String key) {
        Object v = p.get(key);
        if (v instanceof Integer i) return i;
        if (v instanceof Long l) return Math.toIntExact(l);
        // JSON numbers may deserialize as Number / Double; accept only integral values.
        if (v instanceof Number n && n.doubleValue() == Math.floor(n.doubleValue()) && !Double.isInfinite(n.doubleValue())) {
            return n.intValue();
        }
        throw ApiException.badRequest(key + " must be an integer");
    }

    private static boolean optionalBool(Map<String, Object> p, String key, boolean def) {
        Object v = p.get(key);
        if (v == null) return def;
        if (v instanceof Boolean b) return b;
        throw ApiException.badRequest(key + " must be a boolean");
    }

    private static List<String> requireStringList(Map<String, Object> p, String key, String label) {
        Object v = p.get(key);
        if (!(v instanceof List<?> list)) {
            throw ApiException.badRequest(label + " must be a list of strings");
        }
        List<String> out = new java.util.ArrayList<>(list.size());
        for (Object o : list) {
            if (!(o instanceof String s)) {
                throw ApiException.badRequest(label + " entries must be strings");
            }
            if (s.length() > CELL_MAX) {
                throw ApiException.badRequest(label + " entry exceeds " + CELL_MAX + " characters");
            }
            out.add(s);
        }
        return out;
    }

    private static String requireHttpUrl(String raw) {
        URI uri;
        try {
            uri = URI.create(raw);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("src is not a valid URL");
        }
        String scheme = uri.getScheme();
        if (scheme == null || !(scheme.equals("http") || scheme.equals("https"))) {
            throw ApiException.badRequest("src must be an http(s) URL or an uploaded image");
        }
        return raw;
    }
}
