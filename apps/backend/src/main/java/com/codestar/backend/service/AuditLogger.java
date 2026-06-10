package com.codestar.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.event.Level;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Central audit-trail logger. 
 */
@Component
public class AuditLogger {

    private static final Logger log = LoggerFactory.getLogger("audit");

    public AuditEvent event(String action) {
        return new AuditEvent(action);
    }

    public static final class AuditEvent {

        private final String action;
        private final Map<String, Object> fields = new LinkedHashMap<>();

        private AuditEvent(String action) {
            this.action = action;
        }

        public AuditEvent field(String key, Object value) {
            if ("action".equals(key)) {
                throw new IllegalArgumentException("'action' is a reserved audit key");
            }
            fields.put(key, value);
            return this;
        }

        public void log() {
            emit(Level.INFO);
        }

        public void warn() {
            emit(Level.WARN);
        }

        public void debug() {
            emit(Level.DEBUG);
        }

        private void emit(Level level) {
            var builder = log.atLevel(level)
                    .setMessage(message())
                    .addKeyValue("action", action);
            for (Map.Entry<String, Object> e : fields.entrySet()) {
                builder = builder.addKeyValue(e.getKey(), e.getValue());
            }
            builder.log();
        }

        private String message() {
            StringBuilder sb = new StringBuilder(action);
            fields.forEach((k, v) -> sb.append(' ').append(k).append('=').append(v));
            return sb.toString();
        }
    }
}
