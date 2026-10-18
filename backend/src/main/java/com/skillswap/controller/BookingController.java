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

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) throws IOException {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
