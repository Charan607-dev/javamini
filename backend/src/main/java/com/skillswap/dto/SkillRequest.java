package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;

public class SkillRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String category;
    private String description;
    private String level;
    private String proficiencyLevel;
    private String wants;
    private String userId;
    private String ownerEmail;

    // ── Getters & Setters ──

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLevel() {
        return level != null ? level : proficiencyLevel;
    }
    public void setLevel(String level) { this.level = level; }

    public String getProficiencyLevel() {
        return proficiencyLevel != null ? proficiencyLevel : level;
    }
    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }

    public String getWants() { return wants; }
    public void setWants(String wants) { this.wants = wants; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
}
