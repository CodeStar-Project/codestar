package com.codestar.backend.model;

import java.util.Objects;

/**
 * Global roles
 */
public enum Role {
    STUDENT(10),
    TEACHER(20),
    ADMIN(30),
    SUPER_ADMIN(40);

    private final int privilegeLevel;

    Role(int privilegeLevel) {
        this.privilegeLevel = privilegeLevel;
    }

    /**
     * @return {@code true} if this role is at least as privileged as
     *         {@code other}, per the explicit {@code privilegeLevel} ranking.
     */
    public boolean isAtLeast(Role other) {
        Objects.requireNonNull(other, "other role must not be null");
        return this.privilegeLevel >= other.privilegeLevel;
    }
}
