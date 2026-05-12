package com.codestar.backend.repository;

import com.codestar.backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IGroupRepository extends JpaRepository<Group, UUID> {

    Optional<Group> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
