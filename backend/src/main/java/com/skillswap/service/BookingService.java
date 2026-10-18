package com.skillswap.service;

import com.skillswap.dto.BookingRequest;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.model.Booking;
import com.skillswap.model.Skill;
import com.skillswap.model.User;
import com.skillswap.repository.BookingRepository;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          SkillRepository skillRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    public List<Booking> getBookingsByStudentEmail(String email) {
        return bookingRepository.findByStudentEmail(email);
    }

    public List<Booking> getBookingsByTeacherEmail(String email) {
        return bookingRepository.findByTeacherEmail(email);
    }

    public Booking createBooking(String studentId, BookingRequest request) throws IOException {
        String lookupId = studentId != null && !studentId.isBlank() ? studentId : request.getStudentId();
        if (lookupId == null || lookupId.isBlank()) {
            throw new IllegalArgumentException("Student ID or requester ID must be provided");
        }

        User student = userRepository.findById(lookupId).orElse(null);
        if (student == null) {
            student = userRepository.findByEmail(lookupId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + lookupId));
        }

        Skill targetSkill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + request.getSkillId()));

        String exchangeSkillTitle = "Mutual Agreement";
        String exchangeSkillId = "";
        if (request.getExchangeSkillId() != null && !request.getExchangeSkillId().isBlank()) {
            Skill exchange = skillRepository.findById(request.getExchangeSkillId()).orElse(null);
            if (exchange != null) {
                exchangeSkillTitle = exchange.getTitle();
                exchangeSkillId = exchange.getId();
            } else {
                exchangeSkillTitle = request.getExchangeSkillId();
            }
        }

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID().toString());
        booking.setSkillId(targetSkill.getId());
        booking.setTitle(targetSkill.getTitle());
        booking.setCategory(targetSkill.getCategory() != null ? targetSkill.getCategory() : "General");
        booking.setTeacher(targetSkill.getOwnerName());
        booking.setTeacherEmail(targetSkill.getOwnerEmail());
        booking.setStudent(student.getName());
        booking.setStudentEmail(student.getEmail());
        booking.setExchangeSkill(exchangeSkillTitle);
        booking.setExchangeSkillId(exchangeSkillId);
        booking.setDate(request.getDate());
        booking.setTime(request.getTime());
        booking.setStatus("Requested");
        booking.setCreatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(String id, String status) throws IOException {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) throws IOException {
        if (bookingRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Booking not found: " + id);
        }
        bookingRepository.deleteById(id);
    }
}
