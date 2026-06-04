package com.codestar.backend.dto.group;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UpdateGroupRequestDto {

    @Size(min = 1, max = 120)
    private String name;

    private LocalDate startsAt;
    private LocalDate endsAt;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDate startsAt) { this.startsAt = startsAt; }

    public LocalDate getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDate endsAt) { this.endsAt = endsAt; }

    @AssertTrue(message = "endsAt must be on or after startsAt")
    public boolean isDateRangeValid() {
        return startsAt == null || endsAt == null || !endsAt.isBefore(startsAt);
    }
}
