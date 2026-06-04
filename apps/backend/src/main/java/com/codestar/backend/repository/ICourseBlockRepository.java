package com.codestar.backend.repository;

import com.codestar.backend.model.CourseBlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ICourseBlockRepository extends JpaRepository<CourseBlock, UUID> {
}
