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
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(String id, Booking updates) throws IOException {
        Booking existing = getBookingById(id);
        if (updates.getDate() != null && !updates.getDate().isBlank()) existing.setDate(updates.getDate());
        if (updates.getTime() != null && !updates.getTime().isBlank()) existing.setTime(updates.getTime());
        if (updates.getStatus() != null && !updates.getStatus().isBlank()) existing.setStatus(updates.getStatus());
        if (updates.getProposedDate() != null) existing.setProposedDate(updates.getProposedDate().isBlank() ? null : updates.getProposedDate());
        if (updates.getProposedTime() != null) existing.setProposedTime(updates.getProposedTime().isBlank() ? null : updates.getProposedTime());
        if (updates.getRescheduleProposedBy() != null) existing.setRescheduleProposedBy(updates.getRescheduleProposedBy().isBlank() ? null : updates.getRescheduleProposedBy());
        existing.setUpdatedAt(Instant.now());
        return bookingRepository.save(existing);
    }

    public Booking rescheduleBooking(String id, String userIdentifier, com.skillswap.dto.RescheduleRequest request) throws IOException {
        Booking booking = getBookingById(id);

        if (userIdentifier != null && !userIdentifier.isBlank()) {
            validateParticipant(booking, userIdentifier);
        }

        if (request == null) {
            throw new IllegalArgumentException("Reschedule request is required");
        }
        if (request.getProposedDate() == null || request.getProposedDate().isBlank()) {
            throw new IllegalArgumentException("Proposed date is required");
        }
        if (request.getProposedTime() == null || request.getProposedTime().isBlank()) {
            throw new IllegalArgumentException("Proposed time is required");
        }

        java.time.LocalDate date;
        try {
            date = java.time.LocalDate.parse(request.getProposedDate().trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected yyyy-MM-dd");
        }

        if (date.isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Proposed date cannot be in the past");
        }

        String proposer = request.getRescheduleProposedBy();
        if (proposer == null || proposer.isBlank()) {
            proposer = userIdentifier;
        }

        booking.setProposedDate(request.getProposedDate().trim());
        booking.setProposedTime(request.getProposedTime().trim());
        booking.setRescheduleProposedBy(proposer);
        booking.setStatus("Postponed");
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    public Booking acceptReschedule(String id, String userIdentifier) throws IOException {
        Booking booking = getBookingById(id);

        if (userIdentifier != null && !userIdentifier.isBlank()) {
            validateParticipant(booking, userIdentifier);
        }

        if (booking.getProposedDate() == null || booking.getProposedDate().isBlank() ||
            booking.getProposedTime() == null || booking.getProposedTime().isBlank()) {
            throw new IllegalArgumentException("No pending reschedule proposal found for this session");
        }

        if (userIdentifier != null && !userIdentifier.isBlank()) {
            String uid = userIdentifier.trim().toLowerCase();
            String proposedBy = booking.getRescheduleProposedBy() != null ? booking.getRescheduleProposedBy().trim().toLowerCase() : "";
            if (!proposedBy.isEmpty() && uid.equals(proposedBy)) {
                throw new IllegalArgumentException("The other participant must accept the reschedule proposal");
            }
            User u = userRepository.findById(userIdentifier.trim()).orElse(null);
            if (u != null && u.getEmail() != null && u.getEmail().trim().toLowerCase().equals(proposedBy)) {
                throw new IllegalArgumentException("The other participant must accept the reschedule proposal");
            }
        }

        booking.setDate(booking.getProposedDate());
        booking.setTime(booking.getProposedTime());
        booking.setProposedDate(null);
        booking.setProposedTime(null);
        booking.setRescheduleProposedBy(null);
        booking.setStatus("Accepted");
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    private void validateParticipant(Booking booking, String userIdentifier) {
        String uid = userIdentifier.trim().toLowerCase();
        String sEmail = booking.getStudentEmail() != null ? booking.getStudentEmail().toLowerCase() : "";
        String tEmail = booking.getTeacherEmail() != null ? booking.getTeacherEmail().toLowerCase() : "";

        if (uid.equals(sEmail) || uid.equals(tEmail)) {
            return;
        }

        User u = userRepository.findById(userIdentifier.trim())
                .or(() -> userRepository.findByEmail(userIdentifier.trim()))
                .orElse(null);

        if (u != null) {
            String uEmail = u.getEmail() != null ? u.getEmail().toLowerCase() : "";
            if (uEmail.equals(sEmail) || uEmail.equals(tEmail)) {
                return;
            }
        }

        throw new IllegalArgumentException("User " + userIdentifier + " is not an authorized participant of this booking");
    }

    public void deleteBooking(String id) throws IOException {
        if (bookingRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Booking not found: " + id);
        }
        bookingRepository.deleteById(id);
    }
}
