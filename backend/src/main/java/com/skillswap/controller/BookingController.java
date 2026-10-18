package com.skillswap.controller;

import com.skillswap.dto.BookingRequest;
import com.skillswap.model.Booking;
import com.skillswap.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final com.fasterxml.jackson.databind.ObjectMapper mapper;

    public BookingController(BookingService bookingService, com.fasterxml.jackson.databind.ObjectMapper mapper) {
        this.bookingService = bookingService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/student/{email}")
    public ResponseEntity<List<Booking>> getBookingsByStudentEmail(@PathVariable String email) {
        return ResponseEntity.ok(bookingService.getBookingsByStudentEmail(email));
    }

    @GetMapping("/teacher/{email}")
    public ResponseEntity<List<Booking>> getBookingsByTeacherEmail(@PathVariable String email) {
        return ResponseEntity.ok(bookingService.getBookingsByTeacherEmail(email));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestParam(required = false) String studentId,
            @Valid @RequestBody BookingRequest request) throws IOException {
        Booking booking = bookingService.createBooking(studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable String id,
            @RequestBody Booking updates) throws IOException {
        return ResponseEntity.ok(bookingService.updateBooking(id, updates));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatusPatch(
            @PathVariable String id,
            @RequestBody Map<String, String> body) throws IOException {
        String status = body.getOrDefault("status", "Requested");
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatusPut(
            @PathVariable String id,
            @RequestBody Map<String, String> body) throws IOException {
        String status = body.getOrDefault("status", "Requested");
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<Booking> rescheduleBookingPost(
            @PathVariable String id,
            @RequestParam(required = false) String userIdentifier,
            @Valid @RequestBody com.skillswap.dto.RescheduleRequest request) throws IOException {
        return ResponseEntity.ok(bookingService.rescheduleBooking(id, userIdentifier, request));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Booking> rescheduleBookingPut(
            @PathVariable String id,
            @RequestParam(required = false) String userIdentifier,
            @Valid @RequestBody com.skillswap.dto.RescheduleRequest request) throws IOException {
        return ResponseEntity.ok(bookingService.rescheduleBooking(id, userIdentifier, request));
    }

    @PostMapping("/{id}/reschedule/accept")
    public ResponseEntity<Booking> acceptReschedulePost(
            @PathVariable String id,
            @RequestParam(required = false) String userIdentifier,
            jakarta.servlet.http.HttpServletRequest req) throws IOException {
        String uid = resolveUserIdentifier(userIdentifier, req);
        return ResponseEntity.ok(bookingService.acceptReschedule(id, uid));
    }

    @PutMapping("/{id}/reschedule/accept")
    public ResponseEntity<Booking> acceptReschedulePut(
            @PathVariable String id,
            @RequestParam(required = false) String userIdentifier,
            jakarta.servlet.http.HttpServletRequest req) throws IOException {
        String uid = resolveUserIdentifier(userIdentifier, req);
        return ResponseEntity.ok(bookingService.acceptReschedule(id, uid));
    }

    private String resolveUserIdentifier(String userIdentifier, jakarta.servlet.http.HttpServletRequest req) {
        if (userIdentifier != null && !userIdentifier.isBlank()) {
            return userIdentifier;
        }
        if (req != null && req.getContentType() != null && req.getContentType().contains("application/json")) {
            try {
                com.fasterxml.jackson.core.type.TypeReference<Map<String, String>> typeRef = new com.fasterxml.jackson.core.type.TypeReference<>() {};
                Map<String, String> body = mapper.readValue(req.getInputStream(), typeRef);
                if (body != null && body.containsKey("userIdentifier")) {
                    return body.get("userIdentifier");
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) throws IOException {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
