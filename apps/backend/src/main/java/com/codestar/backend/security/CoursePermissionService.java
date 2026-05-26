package com.codestar.backend.security;

import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseStatus;
import com.codestar.backend.model.Role;
import com.codestar.backend.repository.ICourseRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Permission helper exposed to {@code @PreAuthorize} SpEL expressions.
 * - SUPER_ADMIN / ADMIN : full access to any course
 * - TEACHER : edit / publish / delete only their own courses; create allowed
 * - STUDENT / VISITOR : read-only (published courses)
 */
@Service("coursePermissionService")
public class CoursePermissionService {

    private final ICourseRepository courses;

    public CoursePermissionService(ICourseRepository courses) {
        this.courses = courses;
    }

    public boolean canEditCourse(Object principal, UUID courseId) {
        if (!(principal instanceof AuthenticatedUser user) || courseId == null) {
            return false;
        }
        Role role = user.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) {
            return true;
        }
        if (role != Role.TEACHER) {
            return false;
        }
        return courses.findById(courseId)
                .map(Course::getAuthor)
                .map(author -> author != null && user.getId().equals(author.getId()))
                .orElse(false);
    }

    public boolean canViewAllCourses(Object principal) {
        if (!(principal instanceof AuthenticatedUser user)) {
            return false;
        }
        Role role = user.getRole();
        return role == Role.ADMIN || role == Role.SUPER_ADMIN;
    }

    /**
     * Read-visibility rule (hand-off §3 matrix) :
     *  - Anonymous / VISITOR : no access (catalogue is not public)
     *  - Authenticated user : may read PUBLISHED courses
     *  - DRAFT / ARCHIVED : author and ADMIN+ only
     */
    public boolean canReadCourse(Object principal, Course course) {
        if (course == null) return false;
        if (!(principal instanceof AuthenticatedUser user)) return false;
        if (course.getStatus() == CourseStatus.PUBLISHED) return true;

        Role role = user.getRole();
        if (role == Role.ADMIN || role == Role.SUPER_ADMIN) return true;
        return course.getAuthor() != null
                && course.getAuthor().getId().equals(user.getId());
    }

    public boolean canReadCourse(Object principal, UUID courseId) {
        if (courseId == null) return false;
        return courses.findById(courseId)
                .map(c -> canReadCourse(principal, c))
                .orElse(false);
    }
}
