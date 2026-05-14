package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.LoginRequestDto;
import com.codestar.backend.dto.LoginResponseDto;
import com.codestar.backend.dto.MeResponseDto;
import com.codestar.backend.dto.RegisterRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Role;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.GroupService;
import com.codestar.backend.service.InvitationService;
import com.codestar.backend.utils.Emails;
import com.codestar.backend.utils.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * authentification endpoints
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final IUserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final InvitationService invitationService;
    private final GroupService groupService;

    @Value("${codestar.signup.open:false}")
    private boolean signupOpen;

    public AuthController(IUserRepository userRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder, InvitationService invitationService, GroupService groupService) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.invitationService = invitationService;
        this.groupService = groupService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDto<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        User user = userRepository.findByEmail(Emails.normalize(request.getEmail()))
                .filter(User::isActive)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid credentials"));

        String token = jwtUtils.generateToken(user);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Login successful", new LoginResponseDto(token, "Bearer")));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponseDto<LoginResponseDto>> register(@Valid @RequestBody RegisterRequestDto request) {
        String normalizedEmail = Emails.normalize(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ApiException.conflict("Your email is already linked with an account.");
        }

        boolean hasCode = request.getInvitationCode() != null && !request.getInvitationCode().isBlank();
        if (!signupOpen && !hasCode) {
            throw ApiException.badRequest("Registration closed — an invitation code is required.");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getDisplayName(),
                Role.STUDENT);
        user = userRepository.save(user);

        if (hasCode) {
            invitationService.consumeAndJoin(request.getInvitationCode(), user.getId());
        }

        String token = jwtUtils.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(true, "Account created", new LoginResponseDto(token, "Bearer")));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponseDto<MeResponseDto>> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticate");

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> ApiException.unauthorized("Unable to find the user"));

        MeResponseDto body = new MeResponseDto(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getCreatedAt(),
                groupService.listMine(user.getId()));

        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", body));
    }

    // TODO v2
    /**
     * Logout stateless : avec JWT, la déconnexion serveur nécessite une blacklist symétrie + futur durcissement.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponseDto<Void>> logout() {
        return ResponseEntity.noContent().build();
    }
}
