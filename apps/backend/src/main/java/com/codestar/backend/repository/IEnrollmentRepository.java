package com.codestar.backend.repository;

import com.codestar.backend.model.Enrollment;
import com.codestar.backend.model.EnrollmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface IEnrollmentRepository extends JpaRepository<Enrollment, EnrollmentId> {

    List<Enrollment> findByIdUserIdOrderByLastActivityAtDesc(UUID userId);

    @Modifying
    @Query(value = """
            INSERT INTO enrollments (user_id, course_id, progress, last_block_id, completed_at)
            VALUES (:userId, :courseId, :progress, :lastBlockId,
                    CASE WHEN :progress >= 1 THEN NOW() ELSE NULL END)
            ON CONFLICT (user_id, course_id) DO UPDATE
            SET progress = GREATEST(enrollments.progress, EXCLUDED.progress),
                last_block_id = COALESCE(EXCLUDED.last_block_id, enrollments.last_block_id),
                completed_at = CASE
                    WHEN GREATEST(enrollments.progress, EXCLUDED.progress) >= 1
                         AND enrollments.completed_at IS NULL THEN NOW()
                    ELSE enrollments.completed_at
                END,
                last_activity_at = NOW()
            """, nativeQuery = true)
    int upsertProgress(@Param("userId") UUID userId, @Param("courseId") UUID courseId, @Param("progress") BigDecimal progress, @Param("lastBlockId") UUID lastBlockId);
}
