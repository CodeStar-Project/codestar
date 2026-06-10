package com.codestar.backend.config;

import com.codestar.backend.model.Role;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.service.AuditLogger;
import com.codestar.backend.utils.Emails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

/**
 * Create or promotes a super-admin on boot or desactivate if both variables aren't set
 */
@Configuration
public class SuperAdminBootstrap {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminBootstrap.class);

    @Bean
    public CommandLineRunner superAdminRunner(IUserRepository userRepository, PasswordEncoder passwordEncoder, BootstrapProperties props, AuditLogger audit) {
        return args -> {
            String bootstrapEmail = props.email();
            String bootstrapPassword = props.password();
            String bootstrapDisplayName = props.displayName();
            if (bootstrapEmail == null || bootstrapEmail.isBlank()) {
                return;
            }
            if (bootstrapPassword == null || bootstrapPassword.isBlank()) {
                log.warn("Bootstrap : super-admin email set but password missing — skipping.");
                return;
            }

            String normalizedEmail = Emails.normalize(bootstrapEmail);
            Optional<User> existing = userRepository.findByEmail(normalizedEmail);

            if (existing.isEmpty()) {
                User u = new User(normalizedEmail, passwordEncoder.encode(bootstrapPassword), bootstrapDisplayName, Role.SUPER_ADMIN);
                userRepository.save(u);
                audit.event("bootstrap.superadmin_created").log();
                return;
            }

            User user = existing.get();
            if (user.getRole() != Role.SUPER_ADMIN) {
                user.setRole(Role.SUPER_ADMIN);
                userRepository.save(user);
                audit.event("bootstrap.superadmin_promoted").log();
            }
        };
    }
}
