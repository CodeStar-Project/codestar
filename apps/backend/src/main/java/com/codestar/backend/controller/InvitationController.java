package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.InvitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Invitation revocation endpoints
 */
@RestController
@RequestMapping("/api/v1/invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponseDto<Void>> revoke(@PathVariable UUID id, @AuthenticationPrincipal AuthenticatedUser principal) {
        invitationService.revoke(id, principal.getId());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Invitation revoked", null));
    }
}
