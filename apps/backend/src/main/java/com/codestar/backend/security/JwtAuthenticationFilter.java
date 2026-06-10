package com.codestar.backend.security;

import com.codestar.backend.model.User;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.utils.JwtUtils;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * JWT filter that authenticates users via the {@code Authorization} header.
 * Validates the token and populates the {@code SecurityContext} if successful.
 * If validation fails, continues the filter chain without authentication.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtils jwtUtils;
    private final IUserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, IUserRepository userRepository) {
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX) || SecurityContextHolder.getContext().getAuthentication() != null) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length());
        try {
            UUID userId = jwtUtils.getUserIdFromToken(token);
            User user = userRepository.findById(userId).orElse(null);

            if (user != null && user.isActive()) {
                AuthenticatedUser principal = new AuthenticatedUser(user);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                MDC.put("userId", user.getId().toString());
            }
        } catch (JwtException | IllegalArgumentException ignored) {
            // invalid / expired / malformed token = no authentication
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
