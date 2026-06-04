package com.codestar.backend.repository;

import com.codestar.backend.model.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface IAppSettingRepository extends JpaRepository<AppSetting, String> {

    /**
     * Atomic insert-or-update on the {@code key} primary key.
     */
    @Modifying
    @Query(value = """
            INSERT INTO app_settings (key, value, updated_at, updated_by)
            VALUES (:key, :value, now(), :updatedBy)
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by
            """, nativeQuery = true)
    void upsert(@Param("key") String key, @Param("value") String value, @Param("updatedBy") UUID updatedBy);
}
