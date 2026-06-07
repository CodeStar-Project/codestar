package com.codestar.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-user, in-memory token-bucket rate limiter for media uploads
 */
@Component
public class UploadRateLimiter {

    private final int capacity;
    private final double refillPerSecond;
    private final Map<UUID, Bucket> buckets = new ConcurrentHashMap<>();

    public UploadRateLimiter(@Value("${codestar.media.rate-limit.capacity:20}") int capacity, @Value("${codestar.media.rate-limit.refill-per-minute:20}") int refillPerMinute) {
        this.capacity = Math.max(1, capacity);
        this.refillPerSecond = Math.max(1, refillPerMinute) / 60.0;
    }

    public boolean tryAcquire(UUID userId) {
        return buckets
                .computeIfAbsent(userId, k -> new Bucket(capacity))
                .tryConsume(capacity, refillPerSecond);
    }

    private static final class Bucket {
        private double tokens;
        private long lastRefillNanos;

        Bucket(int capacity) {
            this.tokens = capacity;
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
