package com.codestar.backend.repository;

import com.codestar.backend.model.Enrollment;
import com.codestar.backend.model.EnrollmentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IEnrollmentRepository extends JpaRepository<Enrollment, EnrollmentId> {

    List<Enrollment> findByIdUserIdOrderByLastActivityAtDesc(UUID userId);
}
