package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Learner group - {@link GroupMembership}
 */
@Entity
@Table(name = "groups")
public class Group {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(name = "starts_at")
    private LocalDate startsAt;

    @Column(name = "ends_at")
    private LocalDate endsAt;

    @Column(name = "created_by", nullable = false, columnDefinition = "uuid")
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Group() {}

    public Group(String name, String slug, UUID createdBy) {
        this.name = name;
        this.slug = slug;
        this.createdBy = createdBy;
    }

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public LocalDate getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDate startsAt) { this.startsAt = startsAt; }

    public LocalDate getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDate endsAt) { this.endsAt = endsAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
