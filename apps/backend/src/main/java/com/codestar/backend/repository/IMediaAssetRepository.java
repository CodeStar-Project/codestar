package com.codestar.backend.repository;

import com.codestar.backend.model.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface IMediaAssetRepository extends JpaRepository<MediaAsset, UUID> {

    // Total bytes stored by one owner (0 if none)
    @Query("SELECT COALESCE(SUM(m.bytes), 0L) FROM MediaAsset m WHERE m.ownerId = :ownerId")
    long sumBytesByOwner(@Param("ownerId") UUID ownerId);

    // Total bytes stored across the instance (0 if none)
    @Query("SELECT COALESCE(SUM(m.bytes), 0L) FROM MediaAsset m")
    long sumBytesTotal();
}
