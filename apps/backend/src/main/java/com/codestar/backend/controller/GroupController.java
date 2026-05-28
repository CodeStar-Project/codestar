package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.CreateGroupRequestDto;
import com.codestar.backend.dto.CreateInvitationRequestDto;
import com.codestar.backend.dto.GroupResponseDto;
import com.codestar.backend.dto.GroupSummaryDto;
import com.codestar.backend.dto.InvitationResponseDto;
import com.codestar.backend.dto.JoinGroupRequestDto;
import com.codestar.backend.dto.UpdateCurriculumRequestDto;
import com.codestar.backend.dto.UpdateGroupRequestDto;
import com.codestar.backend.dto.course.CourseSummaryDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.InvitationCode;
import com.codestar.backend.repository.IInvitationCodeRepository;
import com.codestar.backend.security.AuthenticatedUser;
import com.codestar.backend.service.GroupCurriculumService;
import com.codestar.backend.service.GroupMemberService;
import com.codestar.backend.service.GroupService;
import com.codestar.backend.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * groups + invitations endpoints
 */
@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;
    private final InvitationService invitationService;
    private final IInvitationCodeRepository invitations;
    private final GroupCurriculumService curriculumService;
    private final GroupMemberService memberService;

    public GroupController(GroupService groupService, InvitationService invitationService, IInvitationCodeRepository invitations, GroupCurriculumService curriculumService, GroupMemberService memberService) {
        this.groupService = groupService;
        this.invitationService = invitationService;
        this.invitations = invitations;
        this.curriculumService = curriculumService;
        this.memberService = memberService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<List<GroupResponseDto>>> listAll() {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", groupService.listAll()));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponseDto<List<GroupSummaryDto>>> listMine(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", groupService.listMine(principal.getId())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<GroupResponseDto>> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", groupService.getOne(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<GroupResponseDto>> create(@Valid @RequestBody CreateGroupRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        GroupResponseDto created = groupService.create(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(true, "Group created", created));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponseDto<GroupResponseDto>> update(@PathVariable UUID id, @Valid @RequestBody UpdateGroupRequestDto request) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Group updated", groupService.update(id, request)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponseDto<UUID>> join(@Valid @RequestBody JoinGroupRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) throw ApiException.unauthorized("Unauthenticated");
        UUID groupId = invitationService.consumeAndJoin(request.getCode(), principal.getId());
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Group joined", groupId));
    }

    @PostMapping("/{groupId}/invitations")
    @PreAuthorize("@groupPermissionService.canManageGroup(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<InvitationResponseDto>> createInvitation(@PathVariable UUID groupId, @Valid @RequestBody CreateInvitationRequestDto request, @AuthenticationPrincipal AuthenticatedUser principal) {
        InvitationCode created = invitationService.create(
            groupId, request.getMaxUses(), request.getExpiresAt(), principal.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponseDto<>(true, "Invitation created", toDto(created)));
    }

    @GetMapping("/{groupId}/invitations")
    @PreAuthorize("@groupPermissionService.canManageGroup(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<List<InvitationResponseDto>>> listInvitations(@PathVariable UUID groupId) {
        List<InvitationResponseDto> body = invitations
                .findByGroupIdAndRevokedAtIsNull(groupId)
                .stream()
                .map(GroupController::toDto)
                .toList();
    
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", body));
    }

    @GetMapping("/{groupId}/curriculum")
    @PreAuthorize("@groupPermissionService.isGroupMember(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<List<CourseSummaryDto>>> getCurriculum(@PathVariable UUID groupId) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", curriculumService.getCurriculum(groupId)));
    }

    @PutMapping("/{groupId}/curriculum")
    @PreAuthorize("@groupPermissionService.canManageGroup(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<List<CourseSummaryDto>>> replaceCurriculum(
            @PathVariable UUID groupId,
            @Valid @RequestBody UpdateCurriculumRequestDto request) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Curriculum updated", curriculumService.replaceCurriculum(groupId, request)));
    }

    @GetMapping("/{groupId}/members")
    @PreAuthorize("@groupPermissionService.canManageGroup(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<List<com.codestar.backend.dto.GroupMemberDto>>> listMembers(@PathVariable UUID groupId) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "OK", memberService.list(groupId)));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("@groupPermissionService.canManageGroup(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<Void>> removeMember(
            @PathVariable UUID groupId, @PathVariable UUID userId) {
        memberService.remove(groupId, userId);
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Member removed", null));
    }

    @PatchMapping("/{groupId}/members/{userId}")
    @PreAuthorize("@groupPermissionService.canManageGroup(principal, #groupId)")
    public ResponseEntity<ApiResponseDto<com.codestar.backend.dto.GroupMemberDto>> updateMemberRole(
            @PathVariable UUID groupId,
            @PathVariable UUID userId,
            @Valid @RequestBody com.codestar.backend.dto.UpdateGroupMemberRoleRequestDto request) {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Member role updated", memberService.updateRole(groupId, userId, request.getRoleInGroup())));
    }

    // helper
    private static InvitationResponseDto toDto(InvitationCode i) {
        return new InvitationResponseDto(
                i.getId(), 
                i.getCode(), 
                i.getGroupId(),
                i.getMaxUses(), 
                i.getUsedCount(),
                i.getExpiresAt(), 
                i.getCreatedAt(), 
                i.getRevokedAt()
            );
    }
}
