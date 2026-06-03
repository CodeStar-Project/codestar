package com.codestar.backend.model;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Runtime, instance-wide setting (key/value).
 */
@Entity
@Table(name = "app_settings")
public class AppSetting {

    @Id
    @Column(length = 64)
    private String key;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "updated_by")
    private UUID updatedBy;

    public AppSetting() {}

    public AppSetting(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() { return key; }
    public String getValue() { return value; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public UUID getUpdatedBy() { return updatedBy; }

    public void setKey(String key) { this.key = key; }
    public void setValue(String value) { this.value = value; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
