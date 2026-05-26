package com.codestar.backend.service;

import com.codestar.backend.dto.UpdateCurriculumRequestDto;
import com.codestar.backend.dto.course.CourseSummaryDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Course;
import com.codestar.backend.model.GroupCurriculum;
import com.codestar.backend.model.GroupCurriculumId;
import com.codestar.backend.repository.ICourseRepository;
import com.codestar.backend.repository.IGroupCurriculumRepository;
import com.codestar.backend.repository.IGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GroupCurriculumService {

    private final IGroupCurriculumRepository curriculum;
    private final IGroupRepository groups;
    private final ICourseRepository courses;

    public GroupCurriculumService(IGroupCurriculumRepository curriculum, IGroupRepository groups, ICourseRepository courses) {
        this.curriculum = curriculum;
        this.groups = groups;
        this.courses = courses;
    }

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getCurriculum(UUID groupId) {
        if (!groups.existsById(groupId)) {
            throw ApiException.notFound("Group not found");
        }
        List<UUID> courseIds = curriculum.findByIdGroupId(groupId).stream()
                .map(gc -> gc.getId().getCourseId())
                .toList();
        if (courseIds.isEmpty()) return List.of();

        return courses.findAllById(courseIds).stream()
                .map(GroupCurriculumService::toSummary)
                .toList();
    }

    @Transactional
    public List<CourseSummaryDto> replaceCurriculum(UUID groupId, UpdateCurriculumRequestDto request) {
        if (!groups.existsById(groupId)) {
            throw ApiException.notFound("Group not found");
        }
        List<UUID> requested = request.getCourseIds() != null ? request.getCourseIds() : List.of();

        if (!requested.isEmpty()) {
            Map<UUID, Course> found = courses.findAllById(requested).stream()
                    .collect(Collectors.toMap(Course::getId, Function.identity()));
            for (UUID id : requested) {
                if (!found.containsKey(id)) {
                    throw ApiException.badRequest("Course not found: " + id);
                }
            }
        }

        curriculum.deleteByIdGroupId(groupId);
        List<GroupCurriculum> rows = requested.stream()
                .distinct()
                .map(courseId -> new GroupCurriculum(new GroupCurriculumId(groupId, courseId)))
                .toList();
        curriculum.saveAll(rows);

        return getCurriculum(groupId);
    }

    private static CourseSummaryDto toSummary(Course c) {
        return new CourseSummaryDto(
                c.getId(), c.getSlug(), c.getTitle(), c.getDescription(),
                c.getCategory(), c.getLevel(), c.getStatus(),
                c.getAuthor() != null ? c.getAuthor().getDisplayName() : null,
                c.getCreatedAt(), c.getUpdatedAt(), c.getPublishedAt());
    }
}
