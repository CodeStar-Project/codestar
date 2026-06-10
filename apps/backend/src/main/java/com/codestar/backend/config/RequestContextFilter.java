package com.codestar.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;


@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestContextFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestContextFilter.class);

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String MDC_REQUEST_ID = "requestId";

    private static final Pattern VALID_REQUEST_ID = Pattern.compile("[A-Za-z0-9_-]{8,64}");

    private static final List<String> SKIP_PREFIXES = List.of("/actuator", "/swagger-ui", "/v3/api-docs");

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain chain) throws ServletException, IOException {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || !VALID_REQUEST_ID.matcher(requestId).matches()) {
            requestId = UUID.randomUUID().toString();
        }
        MDC.put(MDC_REQUEST_ID, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        long startNanos = System.nanoTime();
        try {
            chain.doFilter(request, response);
        } finally {
            if (shouldLog(request)) {
                long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
                log.atInfo()
                        .setMessage("{} {} -> {} ({} ms)")
                        .addArgument(request.getMethod())
                        .addArgument(request.getRequestURI())
                        .addArgument(response.getStatus())
                        .addArgument(durationMs)
                        .addKeyValue("method", request.getMethod())
                        .addKeyValue("path", request.getRequestURI())
                        .addKeyValue("status", response.getStatus())
                        .addKeyValue("durationMs", durationMs)
                        .log();
            }
            MDC.clear();
        }
    }

    private boolean shouldLog(HttpServletRequest request) {
        String uri = request.getRequestURI();
        for (String prefix : SKIP_PREFIXES) {
            if (uri.startsWith(prefix)) {
                return false;
            }
        }
        return true;
    }
}
