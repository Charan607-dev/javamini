package com.skillswap.controller;

import com.skillswap.dto.ScheduleRequest;
import com.skillswap.model.Schedule;
import com.skillswap.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Schedule>> getSchedulesByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Schedule> createSchedule(
            @RequestParam(required = false) String userId,
            @Valid @RequestBody ScheduleRequest request) throws IOException {
        Schedule schedule = scheduleService.createSchedule(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(
            @PathVariable String id,
            @Valid @RequestBody ScheduleRequest request) throws IOException {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable String id) throws IOException {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
