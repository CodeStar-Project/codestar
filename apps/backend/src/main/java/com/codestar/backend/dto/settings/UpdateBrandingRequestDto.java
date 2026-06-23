package com.codestar.backend.dto.settings;

import com.codestar.backend.dto.settings.BrandingDto.LogoDto;
import com.codestar.backend.dto.settings.BrandingDto.ThemeDto;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateBrandingRequestDto {

    @Size(max = 120)
    private String name;

    @Size(max = 240)
    private String tagline;

    private LogoDto logo;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "accent must be a hex color #RRGGBB")
    private String accent;

    @Size(max = 240)
    private String heroTitle;

    @Size(max = 480)
    private String heroSubtitle;

    @Size(max = 80)
    private String heroCta;

    @Pattern(regexp = "^[a-z]{2}(-[A-Z]{2})?$", message = "locale must be like 'en' or 'en-US'")
    private String locale;

    @Size(max = 300)
    private String favicon;

    @Size(max = 120)
    private String metaTitle;

    @Size(max = 320)
    private String metaDescription;

    @Size(max = 60)
    private String fontPreset;

    private ThemeDto theme;

    public UpdateBrandingRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public LogoDto getLogo() { return logo; }
    public void setLogo(LogoDto logo) { this.logo = logo; }

    public String getAccent() { return accent; }
    public void setAccent(String accent) { this.accent = accent; }

    public String getHeroTitle() { return heroTitle; }
    public void setHeroTitle(String heroTitle) { this.heroTitle = heroTitle; }

    public String getHeroSubtitle() { return heroSubtitle; }
    public void setHeroSubtitle(String heroSubtitle) { this.heroSubtitle = heroSubtitle; }

    public String getHeroCta() { return heroCta; }
    public void setHeroCta(String heroCta) { this.heroCta = heroCta; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public String getFavicon() { return favicon; }
    public void setFavicon(String favicon) { this.favicon = favicon; }

    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getFontPreset() { return fontPreset; }
    public void setFontPreset(String fontPreset) { this.fontPreset = fontPreset; }

    public ThemeDto getTheme() { return theme; }
    public void setTheme(ThemeDto theme) { this.theme = theme; }
}
