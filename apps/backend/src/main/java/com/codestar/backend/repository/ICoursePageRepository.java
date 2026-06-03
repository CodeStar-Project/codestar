package com.codestar.backend.repository;

import com.codestar.backend.model.CoursePage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ICoursePageRepository extends JpaRepository<CoursePage, UUID> {

    List<CoursePage> findByCourseIdOrderByOrderIndexAsc(UUID courseId);

    void deleteByCourseId(UUID courseId);
}
