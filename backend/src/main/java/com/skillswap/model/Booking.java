package com.skillswap.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_student_email", columnList = "student_email"),
    @Index(name = "idx_bookings_teacher_email", columnList = "teacher_email"),
    @Index(name = "idx_bookings_skill_id", columnList = "skill_id")
})
public class Booking {

    @Id
    @Column(name = "id", length = 64, nullable = false, updatable = false)
    private String id;

    @Column(name = "skill_id", length = 64)
    private String skillId;

    @Column(name = "title")
    private String title;

    @Column(name = "category")
    private String category;

    @Column(name = "teacher")
    private String teacher;

    @Column(name = "teacher_email")
    private String teacherEmail;

    @Column(name = "student")
    private String student;

    @Column(name = "student_email")
    private String studentEmail;

    @Column(name = "exchange_skill")
    private String exchangeSkill;

    @Column(name = "exchange_skill_id", length = 64)
    private String exchangeSkillId;

    @Column(name = "booking_date")
    private String date;

    @Column(name = "booking_time")
    private String time;

    @Column(name = "status")
    private String status;       // Requested, Accepted, Rejected, Completed, Postponed

    @Column(name = "proposed_date")
    private String proposedDate;

    @Column(name = "proposed_time")
    private String proposedTime;

    @Column(name = "reschedule_proposed_by")
    private String rescheduleProposedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Booking() {
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
