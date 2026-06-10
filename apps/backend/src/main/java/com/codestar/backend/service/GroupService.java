package com.codestar.backend.service;

import com.codestar.backend.dto.group.CreateGroupRequestDto;
import com.codestar.backend.dto.group.GroupResponseDto;
import com.codestar.backend.dto.group.GroupSummaryDto;
import com.codestar.backend.dto.group.UpdateGroupRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.Group;
import com.codestar.backend.model.GroupMemberRole;
import com.codestar.backend.model.GroupMembership;
import com.codestar.backend.model.GroupMembershipId;
import com.codestar.backend.repository.IGroupMembershipRepository;
import com.codestar.backend.repository.IGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final IGroupRepository groups;
    private final IGroupMembershipRepository memberships;
    private final AuditLogger audit;

    public GroupService(IGroupRepository groups, IGroupMembershipRepository memberships, AuditLogger audit) {
        this.groups = groups;
        this.memberships = memberships;
        this.audit = audit;
    }

    @Transactional
    public GroupResponseDto create(CreateGroupRequestDto req, UUID createdBy) {
        String slug = req.getSlug() != null ? req.getSlug() : slugify(req.getName());
        if (groups.existsBySlug(slug)) {
            throw ApiException.conflict("Slug already exist.");
        }

        Group g = new Group(req.getName(), slug, createdBy);
        g.setStartsAt(req.getStartsAt());
        g.setEndsAt(req.getEndsAt());
        validateDates(g);

        groups.save(g);
        memberships.save(new GroupMembership(new GroupMembershipId(createdBy, g.getId()), GroupMemberRole.TEACHER));

        audit.event("group.create").field("groupId", g.getId()).field("slug", slug).field("createdBy", createdBy).log();
        return toDto(g);
    }

    @Transactional
    public GroupResponseDto update(UUID id, UpdateGroupRequestDto req) {
        Group g = groups.findById(id)
                .orElseThrow(() -> ApiException.notFound("Cannot find group"));

        if (req.getName() != null) g.setName(req.getName());
        if (req.getStartsAt() != null) g.setStartsAt(req.getStartsAt());
        if (req.getEndsAt() != null) g.setEndsAt(req.getEndsAt());
        validateDates(g);

        groups.save(g);
        audit.event("group.update").field("groupId", id).log();
        return toDto(g);
    }

    @Transactional(readOnly = true)
    public List<GroupResponseDto> listAll() {
        return groups.findAll().stream().map(GroupService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<GroupSummaryDto> listMine(UUID userId) {
        List<GroupMembership> myMemberships = memberships.findByIdUserId(userId);
        if (myMemberships.isEmpty()) return List.of();

        List<UUID> groupIds = myMemberships.stream()
                .map(m -> m.getId().getGroupId())
                .toList();
                
        Map<UUID, Group> byId = groups.findAllById(groupIds).stream()
                .collect(Collectors.toMap(Group::getId, g -> g));

        return myMemberships.stream()
                .map(m -> {
                    Group g = byId.get(m.getId().getGroupId());
                    if (g == null) return null;
                    return new GroupSummaryDto(
                            g.getId(), g.getName(), g.getSlug(),
                            g.getStartsAt(), g.getEndsAt(),
                            m.getRoleInGroup());
                })
                .filter(s -> s != null)
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponseDto getOne(UUID id) {
        return groups.findById(id)
                .map(GroupService::toDto)
                .orElseThrow(() -> ApiException.notFound("Cannot find group"));
    }

    /**
     * Enrollments and bookmarks survive because they are anchored to courses, not groups.
     */
    @Transactional
    public void delete(UUID id) {
        if (!groups.existsById(id)) {
            throw ApiException.notFound("Cannot find group");
        }
        groups.deleteById(id);
        audit.event("group.delete").field("groupId", id).log();
    }

    // helpers
    private static GroupResponseDto toDto(Group g) {
        return new GroupResponseDto(
                g.getId(), 
                g.getName(), 
                g.getSlug(),
                g.getStartsAt(), 
                g.getEndsAt(),
                g.getCreatedBy(), 
                g.getCreatedAt());
    }

    private static void validateDates(Group g) {
        if (g.getStartsAt() != null && g.getEndsAt() != null && g.getEndsAt().isBefore(g.getStartsAt())) {
            throw ApiException.badRequest("endsAt must be >= startsAt");
        }
    }

    private static String slugify(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+)|(-+$)", "");
        if (normalized.isEmpty()) normalized = "group";
        return normalized.length() > 80 ? normalized.substring(0, 80) : normalized;
    }
}
