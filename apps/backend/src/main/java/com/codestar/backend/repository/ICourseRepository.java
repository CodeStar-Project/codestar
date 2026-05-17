package com.codestar.backend.repository;

import com.codestar.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ICourseRepository extends JpaRepository<Course, UUID> {

    Optional<Course> findBySlug(String slug);

    List<Course> findByStatus(String status);

    List<Course> findByAuthorId(UUID authorId);

    boolean existsBySlug(String slug);
}