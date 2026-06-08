package com.codestar.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Index row for an uploaded media file (course image)
 */
@Entity
@Table(
    name = "media_assets",
    uniqueConstraints = @UniqueConstraint(name = "media_assets_filename_uq", columnNames = "filename")
)
public class MediaAsset {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "filename", nullable = false, unique = true, length = 64)
    private String filename;

    @Column(name = "owner_id", nullable = false, columnDefinition = "uuid")
    private UUID ownerId;

    @Column(name = "content_type", nullable = false, length = 64)
    private String contentType;

    @Column(name = "bytes", nullable = false)
    private long bytes;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "referenced", nullable = false)
    private boolean referenced = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public MediaAsset() {}

    public MediaAsset(String filename, UUID ownerId, String contentType, long bytes, Integer width, Integer height) {
        this.filename = filename;
        this.ownerId = ownerId;
        this.contentType = contentType;
        this.bytes = bytes;
        this.width = width;
        this.height = height;
    }

    public UUID getId() { return id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getBytes() { return bytes; }
    public void setBytes(long bytes) { this.bytes = bytes; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public boolean isReferenced() { return referenced; }
    public void setReferenced(boolean referenced) { this.referenced = referenced; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
