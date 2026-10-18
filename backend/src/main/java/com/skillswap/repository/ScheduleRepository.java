package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.Schedule;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ScheduleRepository {

    private final ObjectMapper mapper;
    private final Map<String, Schedule> schedules = new ConcurrentHashMap<>();

    @Value("${app.data-dir:data}")
    private String dataDir;

    private File file;

    public ScheduleRepository(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() throws IOException {
        file = new File(dataDir, "schedules.json");
        file.getParentFile().mkdirs();
        if (!file.exists()) {
            file.createNewFile();
            mapper.writeValue(file, List.of());
        }
        load();
    }

    private synchronized void load() throws IOException {
        if (file.length() == 0) return;
        List<Schedule> list = mapper.readValue(file, new TypeReference<>() {});
        schedules.clear();
        list.forEach(s -> schedules.put(s.getId(), s));
    }

    private synchronized void save() throws IOException {
        mapper.writeValue(file, new ArrayList<>(schedules.values()));
    }

    public List<Schedule> findAll() {
        return new ArrayList<>(schedules.values());
    }

    public Optional<Schedule> findById(String id) {
        return Optional.ofNullable(schedules.get(id));
    }

    public List<Schedule> findByUserId(String userId) {
        return schedules.values().stream()
                .filter(s -> userId.equals(s.getUserId()))
                .toList();
    }

    public Schedule save(Schedule schedule) throws IOException {
        schedules.put(schedule.getId(), schedule);
        save();
        return schedule;
    }

    public void deleteById(String id) throws IOException {
        schedules.remove(id);
        save();
    }
}
