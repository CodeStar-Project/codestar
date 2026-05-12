package com.codestar.backend.repository;

import com.codestar.backend.model.InvitationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IInvitationCodeRepository extends JpaRepository<InvitationCode, UUID> {

    Optional<InvitationCode> findByCode(String code);

    List<InvitationCode> findByGroupIdAndRevokedAtIsNull(UUID groupId);
}
