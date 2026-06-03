package com.codestar.backend.service;

import com.codestar.backend.dto.settings.SettingsDto;
import com.codestar.backend.dto.settings.UpdateSettingsRequestDto;
import com.codestar.backend.exception.ApiException;
import com.codestar.backend.model.AppSetting;
import com.codestar.backend.repository.IAppSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class SettingsService {

    private static final Logger log = LoggerFactory.getLogger(SettingsService.class);

    static final String KEY_MAX_BLOCKS_PER_PAGE = "max_blocks_per_page";
    public static final int DEFAULT_MAX_BLOCKS_PER_PAGE = 50;
    public static final int MIN_MAX_BLOCKS_PER_PAGE = 1;
    public static final int MAX_MAX_BLOCKS_PER_PAGE = 1000;

    private final IAppSettingRepository repository;

    public SettingsService(IAppSettingRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public SettingsDto get() {
        return new SettingsDto(getMaxBlocksPerPage());
    }

    @Transactional(readOnly = true)
    public int getMaxBlocksPerPage() {
        return repository.findById(KEY_MAX_BLOCKS_PER_PAGE)
                .map(s -> parseOrDefault(s.getValue()))
                .orElse(DEFAULT_MAX_BLOCKS_PER_PAGE);
    }

    @Transactional
    public SettingsDto update(UpdateSettingsRequestDto request, UUID userId) {
        if (request.getMaxBlocksPerPage() != null) {
            setMaxBlocksPerPage(request.getMaxBlocksPerPage(), userId);
        }
        return get();
    }

    private void setMaxBlocksPerPage(int value, UUID userId) {
        if (value < MIN_MAX_BLOCKS_PER_PAGE || value > MAX_MAX_BLOCKS_PER_PAGE) {
            throw ApiException.badRequest("maxBlocksPerPage must be between " + MIN_MAX_BLOCKS_PER_PAGE + " and " + MAX_MAX_BLOCKS_PER_PAGE);
        }
        AppSetting setting = repository.findById(KEY_MAX_BLOCKS_PER_PAGE)
                .orElseGet(() -> new AppSetting(KEY_MAX_BLOCKS_PER_PAGE, String.valueOf(value)));
        setting.setValue(String.valueOf(value));
        setting.setUpdatedAt(OffsetDateTime.now());
        setting.setUpdatedBy(userId);
        repository.save(setting);
    }

    private int parseOrDefault(String raw) {
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            log.warn("Invalid {} setting value '{}', falling back to default", KEY_MAX_BLOCKS_PER_PAGE, raw);
            return DEFAULT_MAX_BLOCKS_PER_PAGE;
        }
    }
}
