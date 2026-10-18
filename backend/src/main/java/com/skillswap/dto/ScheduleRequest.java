package com.skillswap.dto;

public class ScheduleRequest {

    private String userId;
    private String title;
    private String date;
    private String time;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String description;

    // ── Getters & Setters ──

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() {
        if (title != null && !title.isBlank()) return title;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) return dayOfWeek + " Availability";
        return "Study Session";
    }
    public void setTitle(String title) { this.title = title; }

    public String getDate() {
        if (date != null && !date.isBlank()) return date;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) return dayOfWeek;
        return "Flexible";
    }
    public void setDate(String date) { this.date = date; }

    public String getTime() {
        if (time != null && !time.isBlank()) return time;
        if (startTime != null && endTime != null) return startTime + " - " + endTime;
        if (startTime != null) return startTime;
        return "Flexible";
    }
    public void setTime(String time) { this.time = time; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
