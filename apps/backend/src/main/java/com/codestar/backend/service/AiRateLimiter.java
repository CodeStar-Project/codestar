package com.codestar.backend.service;

import com.codestar.backend.config.AiProperties;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-user token-bucket rate limiter for AI course generation requests.
 * Prevents a single user from exhausting the shared API quota.
 */
@Component
public class AiRateLimiter {

    private final int capacity;
    private final double refillPerSecond;
    private final Map<UUID, Bucket> buckets = new ConcurrentHashMap<>();

    public AiRateLimiter(AiProperties props) {
        this.capacity = props.rateLimitCapacity();
        this.refillPerSecond = props.rateLimitRefillPerMinute() / 60.0;
    }

    /**
     * Attempts to consume one token for the given user.
     *
     * @return true if the request is allowed, false if the user is rate-limited
     */
    public boolean tryAcquire(UUID userId) {
        return buckets
                .computeIfAbsent(userId, k -> new Bucket(capacity))
                .tryConsume(capacity, refillPerSecond);
    }

    private static final class Bucket {

        private double tokens;
        private long lastRefillNanos;

        Bucket(int initialCapacity) {
            this.tokens = initialCapacity;
            this.lastRefillNanos = System.nanoTime();
        }

        synchronized boolean tryConsume(int capacity, double refillPerSecond) {
            long now = System.nanoTime();
            double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
            tokens = Math.min(capacity, tokens + elapsedSeconds * refillPerSecond);
            lastRefillNanos = now;
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }
    }
}
