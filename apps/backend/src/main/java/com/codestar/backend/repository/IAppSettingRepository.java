package com.codestar.backend.repository;

import com.codestar.backend.model.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IAppSettingRepository extends JpaRepository<AppSetting, String> {
}
