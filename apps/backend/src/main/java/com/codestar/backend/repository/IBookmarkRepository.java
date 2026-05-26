package com.codestar.backend.repository;

import com.codestar.backend.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IBookmarkRepository extends JpaRepository<Bookmark, UUID> {

    List<Bookmark> findByUserIdAndCourseId(UUID userId, UUID courseId);

    Optional<Bookmark> findByUserIdAndBlockId(UUID userId, UUID blockId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Modifying
    @Query(value = """
            INSERT INTO bookmarks (user_id, course_id, block_id)
            VALUES (:userId, :courseId, :blockId)
            ON CONFLICT ON CONSTRAINT bookmarks_user_block_uq DO NOTHING
            """, nativeQuery = true)
    int upsert(@Param("userId") UUID userId, @Param("courseId") UUID courseId, @Param("blockId") UUID blockId);
}
