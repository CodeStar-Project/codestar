package com.codestar.backend.service;

import com.codestar.backend.dto.UserSummaryDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Role;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final IUserRepository userRepository;

    public UserService(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> listAll(String roleFilter, Boolean disabledFilter, String q) {
        return userRepository.findAll().stream()
                .filter(u -> roleFilter == null || roleFilter.isBlank() || u.getRole().name().equals(roleFilter))
                .filter(u -> disabledFilter == null
                        || (disabledFilter ? u.getDisabledAt() != null : u.getDisabledAt() == null))
                .filter(u -> q == null || q.isBlank()
                        || u.getEmail().toLowerCase().contains(q.toLowerCase())
                        || u.getDisplayName().toLowerCase().contains(q.toLowerCase()))
                .map(UserService::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserSummaryDto updateRole(UUID targetId, String newRoleRaw, AuthenticatedUser actor) {
        if (actor == null) throw ApiException.unauthorized("Unauthenticated");
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> ApiException.notFound("User not found: " + targetId));

        if (target.getId().equals(actor.getId()))
            throw ApiException.badRequest("Cannot change your own role");

        Role newRole;
        try {
            newRole = Role.valueOf(newRoleRaw);
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid role: " + newRoleRaw);
        }

        Role actorRole = actor.getRole();
        if (actorRole != Role.SUPER_ADMIN) {
            if (target.getRole().isAtLeast(actorRole)) {
                throw ApiException.forbidden("Cannot change role of an equal-or-higher user");
            }
            if (newRole.isAtLeast(actorRole)) {
                throw ApiException.forbidden("Cannot promote at or above your own role");
            }
        }

        target.setRole(newRole);
        return toDto(userRepository.save(target));
    }

    @Transactional
    public UserSummaryDto setDisabled(UUID targetId, boolean disabled, AuthenticatedUser actor) {
        if (actor == null) throw ApiException.unauthorized("Unauthenticated");
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> ApiException.notFound("User not found: " + targetId));

        if (target.getId().equals(actor.getId()))
            throw ApiException.badRequest("Cannot disable yourself");

        Role actorRole = actor.getRole();
        if (actorRole != Role.SUPER_ADMIN && target.getRole().isAtLeast(actorRole)) 
            throw ApiException.forbidden("Cannot disable an equal-or-higher user");

        target.setDisabledAt(disabled ? OffsetDateTime.now() : null);
        return toDto(userRepository.save(target));
    }

    private static UserSummaryDto toDto(User u) {
        return new UserSummaryDto(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getRole().name(),
                u.getCreatedAt(),
                u.getDisabledAt()
        );
    }
}
