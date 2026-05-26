package com.codestar.backend.repository;

import com.codestar.backend.model.GroupCurriculum;
import com.codestar.backend.model.GroupCurriculumId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IGroupCurriculumRepository extends JpaRepository<GroupCurriculum, GroupCurriculumId> {

    List<GroupCurriculum> findByIdGroupId(UUID groupId);

    List<GroupCurriculum> findByIdCourseId(UUID courseId);

    void deleteByIdGroupId(UUID groupId);
}
