package com.codestar.backend.dto.settings;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class UpdateSettingsRequestDto {

    private Boolean signupOpen;

    @Positive(message = "mediaUserQuotaMb must be positive")
    private Long mediaUserQuotaMb;

    @Positive(message = "mediaInstanceQuotaMb must be positive")
    private Long mediaInstanceQuotaMb;

    @Size(max = 300)
    private String aiApiUrl;

    @Size(max = 300)
    private String aiApiKey;

    @Size(max = 120)
    private String aiModel;

    @Min(value = 1, message = "aiMaxTokens must be at least 1")
    @Max(value = 100000, message = "aiMaxTokens must be at most 100000")
    private Integer aiMaxTokens;

    @DecimalMin(value = "0.0", message = "aiTemperature must be >= 0")
    @DecimalMax(value = "2.0", message = "aiTemperature must be <= 2")
    private Double aiTemperature;

    public UpdateSettingsRequestDto() {}

    public Boolean getSignupOpen() { return signupOpen; }
    public void setSignupOpen(Boolean signupOpen) { this.signupOpen = signupOpen; }

    public Long getMediaUserQuotaMb() { return mediaUserQuotaMb; }
    public void setMediaUserQuotaMb(Long mediaUserQuotaMb) { this.mediaUserQuotaMb = mediaUserQuotaMb; }

    public Long getMediaInstanceQuotaMb() { return mediaInstanceQuotaMb; }
    public void setMediaInstanceQuotaMb(Long mediaInstanceQuotaMb) { this.mediaInstanceQuotaMb = mediaInstanceQuotaMb; }

    public String getAiApiUrl() { return aiApiUrl; }
    public void setAiApiUrl(String aiApiUrl) { this.aiApiUrl = aiApiUrl; }

    public String getAiApiKey() { return aiApiKey; }
    public void setAiApiKey(String aiApiKey) { this.aiApiKey = aiApiKey; }

    public String getAiModel() { return aiModel; }
    public void setAiModel(String aiModel) { this.aiModel = aiModel; }

    public Integer getAiMaxTokens() { return aiMaxTokens; }
    public void setAiMaxTokens(Integer aiMaxTokens) { this.aiMaxTokens = aiMaxTokens; }

    public Double getAiTemperature() { return aiTemperature; }
    public void setAiTemperature(Double aiTemperature) { this.aiTemperature = aiTemperature; }
}
