package com.codestar.backend.service;

import com.codestar.backend.config.MediaProperties;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-user, in-memory token-bucket rate limiter for media uploads.
 */
@Component
public class UploadRateLimiter {

    private final int capacity;
    private final double refillPerSecond;
    private final long idleTtlNanos;
    private final Map<UUID, Bucket> buckets = new ConcurrentHashMap<>();

    public UploadRateLimiter(MediaProperties props) {
        MediaProperties.RateLimit rl = props.rateLimit();
        this.capacity = rl.capacity();
        this.refillPerSecond = rl.refillPerMinute() / 60.0;
        this.idleTtlNanos = rl.idleTtlMinutes() * 60L * 1_000_000_000L;
    }

    // @return true if the upload is allowed, false if the user is over their rate.
    public boolean tryAcquire(UUID userId) {
        return buckets
                .computeIfAbsent(userId, k -> new Bucket(capacity))
                .tryConsume(capacity, refillPerSecond);
    }

    @Scheduled(fixedDelayString = "${codestar.media.rate-limit.sweep-ms}")
    void evictIdle() {
        long cutoff = System.nanoTime() - idleTtlNanos;
        buckets.values().removeIf(b -> b.idleBefore(cutoff));
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

        synchronized boolean idleBefore(long cutoffNanos) {
            return lastRefillNanos - cutoffNanos < 0;
        }
    }
}
