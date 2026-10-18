package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;

public class MessageRequest {

    private String senderId;

    @NotBlank(message = "Receiver ID is required")
    private String receiverId;

    @NotBlank(message = "Content is required")
    private String content;

    // ── Getters & Setters ──

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
