package com.skillswap.model;

import java.time.Instant;
import java.util.UUID;

public class Booking {

    private String id;
    private String skillId;
    private String title;
    private String category;

    private String teacher;
    private String teacherEmail;

    private String student;
    private String studentEmail;

    private String exchangeSkill;
    private String exchangeSkillId;

    private String date;
    private String time;
    private String status;       // Requested, Accepted, Rejected, Completed, Postponed
    private String proposedDate;
    private String proposedTime;
    private String rescheduleProposedBy;
    private Instant createdAt;
    private Instant updatedAt;

    public Booking() {
    }

    // ── Getters & Setters ──

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSkillId() { return skillId; }
    public void setSkillId(String skillId) { this.skillId = skillId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTeacher() { return teacher; }
    public void setTeacher(String teacher) { this.teacher = teacher; }

    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }

    public String getStudent() { return student; }
    public void setStudent(String student) { this.student = student; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getExchangeSkill() { return exchangeSkill; }
    public void setExchangeSkill(String exchangeSkill) { this.exchangeSkill = exchangeSkill; }

    public String getExchangeSkillId() { return exchangeSkillId; }
    public void setExchangeSkillId(String exchangeSkillId) { this.exchangeSkillId = exchangeSkillId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProposedDate() { return proposedDate; }
    public void setProposedDate(String proposedDate) { this.proposedDate = proposedDate; }

    public String getProposedTime() { return proposedTime; }
    public void setProposedTime(String proposedTime) { this.proposedTime = proposedTime; }

    public String getRescheduleProposedBy() { return rescheduleProposedBy; }
    public void setRescheduleProposedBy(String rescheduleProposedBy) { this.rescheduleProposedBy = rescheduleProposedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
