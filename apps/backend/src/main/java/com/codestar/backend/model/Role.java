package com.codestar.backend.model;

/**
 * Global roles, ordered least-to-most privileged.
 * 
 * {@code STUDENT < TEACHER < ADMIN < SUPER_ADMIN} is defined entirely by the
 * order below. Reordering or inserting a constant mid-list silently breaks
 * every authorization check. Append new roles at the correct privilege rank
 * only.
 */
public enum Role {
    STUDENT,
    TEACHER,
    ADMIN,
    SUPER_ADMIN;

    /**
     * @return {@code true} if this role is at least as privileged as
     *         {@code other}, per the declaration-order hierarchy above.
     */
    public boolean isAtLeast(Role other) {
        return this.ordinal() >= other.ordinal();
    }
}
