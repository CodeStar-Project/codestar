package com.codestar.backend.service;

import com.codestar.backend.model.Course;
import com.codestar.backend.model.CourseStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Composable JPA Criteria specs for course filtering.
 */
public final class CourseSpecifications {

    private CourseSpecifications() {}

    public static Specification<Course> byStatus(CourseStatus status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Course> byCategory(String category) {
        if (category == null || category.isBlank()) return null;
        return (root, query, cb) -> cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }

    public static Specification<Course> byLevel(String level) {
        if (level == null || level.isBlank()) return null;
        return (root, query, cb) -> cb.equal(root.get("level"), level);
    }

    public static Specification<Course> byAuthorId(UUID authorId) {
        if (authorId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("author").get("id"), authorId);
    }

    /** Case-insensitive substring search on title + description. */
    public static Specification<Course> byQuery(String q) {
        if (q == null || q.isBlank()) return null;
        String like = "%" + q.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("description")), like)
        );
    }

    @SafeVarargs
    public static Specification<Course> all(Specification<Course>... specs) {
        List<Specification<Course>> nonNull = new ArrayList<>();
        for (Specification<Course> s : specs) if (s != null) nonNull.add(s);
        if (nonNull.isEmpty()) return null;
        return (root, query, cb) -> {
            Predicate[] predicates = nonNull.stream()
                    .map(s -> s.toPredicate(root, query, cb))
                    .toArray(Predicate[]::new);
            return cb.and(predicates);
        };
    }
}
