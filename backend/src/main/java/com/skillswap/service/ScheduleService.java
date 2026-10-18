package com.skillswap.service;

import com.skillswap.dto.ScheduleRequest;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.model.Schedule;
import com.skillswap.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<Schedule> getSchedulesByUserId(String userId) {
        return scheduleRepository.findByUserId(userId);
    }

    public Schedule createSchedule(String userId, ScheduleRequest request) throws IOException {
        String uid = userId != null && !userId.isBlank() ? userId : (request != null ? request.getUserId() : null);
        if (uid == null || uid.isBlank()) {
            throw new IllegalArgumentException("User ID is required for schedule");
        }

        Schedule schedule = new Schedule();
        schedule.setId(UUID.randomUUID().toString());
        schedule.setUserId(uid);
        schedule.setTitle(request != null ? request.getTitle() : "Available");
        schedule.setDate(request != null ? request.getDate() : "Flexible");
        schedule.setTime(request != null ? request.getTime() : "Flexible");
        schedule.setDescription(request != null && request.getDescription() != null ? request.getDescription().trim() : null);
        schedule.setCreatedAt(Instant.now());

        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(String id) throws IOException {
        if (scheduleRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Schedule not found: " + id);
        }
        scheduleRepository.deleteById(id);
    }
}
