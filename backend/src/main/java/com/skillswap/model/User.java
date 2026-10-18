package com.skillswap.model;

import java.time.Instant;
import java.util.UUID;

public class User {

    private String id;
    private String name;
    private String email;
    private String college;
    private String password;
    private Instant createdAt;

    public User() {
    }

    public User(String name, String email, String college, String password) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.college = college;
        this.password = password;
        this.createdAt = Instant.now();
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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
