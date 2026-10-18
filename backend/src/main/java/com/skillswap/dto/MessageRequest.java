package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;

public class MessageRequest {

    private String senderId;
    private String senderEmail;
    private String senderName;

    private String receiverId;
    private String receiverEmail;

    private String bookingId;

    @NotBlank(message = "Content is required")
    private String content;

    // ── Getters & Setters ──

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

    public String getReceiverEmail() { return receiverEmail; }
    public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
