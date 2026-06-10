package com.codestar.backend.exception;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.service.AuditLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Converts common exceptions into a consistent {@link ApiResponseDto} JSON.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class); // on en a toujours besoin ?
    private final AuditLogger audit;

    public GlobalExceptionHandler(AuditLogger audit) {
        this.audit = audit;
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleApi(ApiException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(new ApiResponseDto<>(false, ex.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::format)
                .collect(Collectors.joining(" · "));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponseDto<>(false, msg.isEmpty() ? "Invalid request" : msg, null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleAccessDenied(AccessDeniedException ex) {
        audit.event("security.access_denied").warn();
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponseDto<>(false, "Access denied", null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponseDto<Void>> handleAuth(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponseDto<>(false, "Unauthenticated", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDto<Void>> handleAny(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponseDto<>(false, "Internal error", null));
    }

    private static String format(FieldError e) {
        return e.getField() + ": " + e.getDefaultMessage();
    }
}
