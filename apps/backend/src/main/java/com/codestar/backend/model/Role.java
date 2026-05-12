package com.codestar.backend.model;

/**
 * Global roles
 */
public enum Role {
    STUDENT,
    TEACHER,
    ADMIN,
    SUPER_ADMIN;

    public boolean isAtLeast(Role other) {
        return this.ordinal() >= other.ordinal();
    }
}
