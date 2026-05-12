package com.codestar.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class JoinGroupRequestDto {

    @NotBlank
    @Pattern(regexp = "^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$", message = "Format attendu : XXXX-XXXX-XXXX")
    private String code;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
