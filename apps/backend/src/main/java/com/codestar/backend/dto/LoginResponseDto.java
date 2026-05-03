package com.codestar.backend.dto;

public class LoginResponseDto {
    private String accessToken;
    private String tokenType;

    public LoginResponseDto(String accessToken, String tokenType) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }
}
