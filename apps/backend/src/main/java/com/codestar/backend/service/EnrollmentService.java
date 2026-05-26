package com.codestar.backend.service;

import com.codestar.backend.dto.EnrollmentDto;
import com.codestar.backend.dto.UpdateProgressRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.CourseBlock;
import com.codestar.backend.model.Enrollment;
import com.codestar.backend.model.EnrollmentId;
import com.codestar.backend.repository.ICourseBlockRepository;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.repository.IEnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class EnrollmentService {

    private final IEnrollmentRepository enrollments;
    private final ICourseRepository courses;
    private final ICourseBlockRepository blocks;

    public EnrollmentService(IEnrollmentRepository enrollments, ICourseRepository courses, ICourseBlockRepository blocks) {
        this.enrollments = enrollments;
        this.courses = courses;
        this.blocks = blocks;
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> listMine(UUID userId) {
        return enrollments.findByIdUserIdOrderByLastActivityAtDesc(userId)
                .stream()
                .map(EnrollmentService::toDto)
                .toList();
    }

    @Transactional
    public EnrollmentDto updateProgress(UUID userId, UUID courseId, UpdateProgressRequestDto request) {
        if (!courses.existsById(courseId)) {
            throw ApiException.notFound("Course not found: " + courseId);
        }

        BigDecimal progress = request.getProgress().setScale(2, RoundingMode.HALF_UP);

        EnrollmentId id = new EnrollmentId(userId, courseId);
        BigDecimal current = enrollments.findById(id)
                .map(Enrollment::getProgress)
                .orElse(BigDecimal.ZERO);
        if (progress.compareTo(current) < 0) {
            throw ApiException.badRequest("progress cannot decrease");
        }

        UUID validatedBlockId = null;
        if (request.getLastBlockId() != null) {
            CourseBlock block = blocks.findById(request.getLastBlockId())
                    .orElseThrow(() -> ApiException.notFound("Block not found: " + request.getLastBlockId()));
            if (block.getCourse() == null || !block.getCourse().getId().equals(courseId)) {
                throw ApiException.badRequest("lastBlockId does not belong to the given course");
            }
            validatedBlockId = block.getId();
        }
        
        enrollments.upsertProgress(userId, courseId, progress, validatedBlockId);

        Enrollment persisted = enrollments.findById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Enrollment upsert succeeded but row not found for user=" + userId
                                + " course=" + courseId));

        return toDto(persisted);
    }

    private static EnrollmentDto toDto(Enrollment e) {
        return new EnrollmentDto(
                e.getId().getUserId(),
                e.getId().getCourseId(),
                e.getProgress(),
                e.getLastBlockId(),
                e.getStartedAt(),
                e.getCompletedAt(),
                e.getLastActivityAt()
        );
    }
}
