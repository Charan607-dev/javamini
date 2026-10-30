package com.skillswap.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "skills", indexes = {
    @Index(name = "idx_skills_owner_email", columnList = "owner_email")
})
public class Skill {

    @Id
    @Column(name = "id", length = 64, nullable = false, updatable = false)
    private String id;

    @Column(name = "owner_email", nullable = false)
    private String ownerEmail;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "category")
    private String category;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "level")
    private String level;

    @Column(name = "wants")
    private String wants;          // what the owner wants to learn in return

    @Column(name = "created_at", nullable = false)
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

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
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
