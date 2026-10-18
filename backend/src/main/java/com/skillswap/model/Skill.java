package com.skillswap.model;

import java.time.Instant;
import java.util.UUID;

public class Skill {

    private String id;
    private String ownerEmail;
    private String ownerName;
    private String title;
    private String category;
    private String description;
    private String level;
    private String wants;          // what the owner wants to learn in return
    private Instant createdAt;

    public Skill() {
    }

    public Skill(String ownerEmail, String ownerName, String title,
                 String category, String description, String level, String wants) {
        this.id = UUID.randomUUID().toString();
        this.ownerEmail = ownerEmail;
        this.ownerName = ownerName;
        this.title = title;
        this.category = category;
        this.description = description;
        this.level = level;
        this.wants = wants;
        this.createdAt = Instant.now();
    }

    // ── Getters & Setters ──

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getWants() { return wants; }
    public void setWants(String wants) { this.wants = wants; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
