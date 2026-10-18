package com.skillswap.dto;

import java.time.Instant;

/**
 * Public user response — never includes the password.
 */
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String college;
    private Instant createdAt;

    public UserResponse() {
    }

    public UserResponse(String id, String name, String email, String college, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.createdAt = createdAt;
    }

    // ── Getters & Setters ──

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
