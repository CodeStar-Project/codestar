package com.codestar.backend.dto.group;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class CreateGroupRequestDto {

    @NotBlank
    @Size(min = 1, max = 120)
    private String name;

    // optional
    @Pattern(regexp = "^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$", message = "Slug : lowercase, alphanumeric + hyphens, 1..80 chars")
    private String slug;

    private LocalDate startsAt;
    private LocalDate endsAt;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public LocalDate getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDate startsAt) { this.startsAt = startsAt; }

    public LocalDate getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDate endsAt) { this.endsAt = endsAt; }

    @AssertTrue(message = "endsAt must be on or after startsAt")
    public boolean isDateRangeValid() {
        return startsAt == null || endsAt == null || !endsAt.isBefore(startsAt);
    }
}
