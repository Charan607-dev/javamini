package com.skillswap.repository;

import com.skillswap.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByStudentEmailIgnoreCase(String studentEmail);

    default List<Booking> findByStudentEmail(String studentEmail) {
        if (studentEmail == null) return List.of();
        return findByStudentEmailIgnoreCase(studentEmail.trim());
    }

    List<Booking> findByTeacherEmailIgnoreCase(String teacherEmail);

    default List<Booking> findByTeacherEmail(String teacherEmail) {
        if (teacherEmail == null) return List.of();
        return findByTeacherEmailIgnoreCase(teacherEmail.trim());
    }

    List<Booking> findBySkillId(String skillId);
}
