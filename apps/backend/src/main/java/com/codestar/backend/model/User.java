package com.codestar.backend.model;

import com.codestar.backend.utils.Emails;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * CodeStar user (learner, teacher, admin) - {@code users}.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "display_name", nullable = false, length = 120)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role = Role.STUDENT;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "disabled_at")
    private OffsetDateTime disabledAt;

    public User() {}

    public User(String email, String passwordHash, String displayName, Role role) {
        this.email = Emails.normalize(email);
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.role = role != null ? role : Role.STUDENT;
    }

    public UUID getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = Emails.normalize(email); }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getDisabledAt() { return disabledAt; }
    public void setDisabledAt(OffsetDateTime disabledAt) { this.disabledAt = disabledAt; }

    public boolean isActive() { return disabledAt == null; }
}
