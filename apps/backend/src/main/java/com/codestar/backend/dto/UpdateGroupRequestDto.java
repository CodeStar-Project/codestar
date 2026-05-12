package com.codestar.backend.dto;

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
}
