package com.codestar.backend.repository;

import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ICourseRepository extends JpaRepository<Course, UUID>, JpaSpecificationExecutor<Course> {

    Optional<Course> findBySlug(String slug);

    List<Course> findByStatus(CourseStatus status);

    List<Course> findByAuthorId(UUID authorId);

    boolean existsBySlug(String slug);
}
