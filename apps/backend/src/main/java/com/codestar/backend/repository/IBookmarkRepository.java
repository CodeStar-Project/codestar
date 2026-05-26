package com.codestar.backend.repository;

import com.codestar.backend.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IBookmarkRepository extends JpaRepository<Bookmark, UUID> {

    List<Bookmark> findByUserIdAndCourseId(UUID userId, UUID courseId);

    Optional<Bookmark> findByUserIdAndBlockId(UUID userId, UUID blockId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
