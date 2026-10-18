package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;

public class BookingRequest {

    @NotBlank(message = "Skill ID is required")
    private String skillId;

    private String exchangeSkillId;
    private String date;
    private String time;
    private String scheduledTime;
    private String studentId;
    private String requesterId;
    private String providerId;
    private String notes;

    // ── Getters & Setters ──

    public String getSkillId() { return skillId; }
    public void setSkillId(String skillId) { this.skillId = skillId; }

    public String getExchangeSkillId() { return exchangeSkillId; }
    public void setExchangeSkillId(String exchangeSkillId) { this.exchangeSkillId = exchangeSkillId; }

    public String getDate() {
        if (date != null && !date.isBlank()) return date;
        if (scheduledTime != null && scheduledTime.contains("T")) {
            return scheduledTime.split("T")[0];
        }
        return date != null ? date : "TBD";
    }
    public void setDate(String date) { this.date = date; }

    public String getTime() {
        if (time != null && !time.isBlank()) return time;
        if (scheduledTime != null && scheduledTime.contains("T")) {
            String[] parts = scheduledTime.split("T");
            if (parts.length > 1) return parts[1].replace("Z", "");
        }
        return time != null ? time : "TBD";
    }
    public void setTime(String time) { this.time = time; }

    public String getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }

    public String getStudentId() {
        return studentId != null ? studentId : requesterId;
    }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getRequesterId() {
        return requesterId != null ? requesterId : studentId;
    }
    public void setRequesterId(String requesterId) { this.requesterId = requesterId; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
