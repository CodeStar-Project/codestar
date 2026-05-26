package com.codestar.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * PATCH branding payload — every field is optional, only non-null fields are applied.
 */
public class UpdateBrandingRequestDto {

    @Size(max = 120)
    private String name;

    @Size(max = 240)
    private String tagline;

    private InstanceBrandingDto.LogoDto logo;

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

    public UpdateBrandingRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public InstanceBrandingDto.LogoDto getLogo() { return logo; }
    public void setLogo(InstanceBrandingDto.LogoDto logo) { this.logo = logo; }

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
}
