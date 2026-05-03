package com.codestar.backend.dto;

public class ApiResponseDto<T> {
    private boolean success;
    private String message;
    private T data;

    public ApiResponseDto(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }
}
