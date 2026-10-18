package com.skillswap.dto;

import java.time.Instant;

/**
 * Response returned after successful registration or login.
 * Never includes the password hash.
 */
public class AuthResponse {

    private String id;
    private String name;
    private String email;
    private String college;
    private String message;
    private Instant createdAt;

    public AuthResponse() {
    }

    public AuthResponse(String id, String name, String email, String college, String message, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.college = college;
        this.message = message;
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

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
