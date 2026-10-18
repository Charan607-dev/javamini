package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.Booking;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class BookingRepository {

    private final ObjectMapper mapper;
    private final Map<String, Booking> bookings = new ConcurrentHashMap<>();

    @Value("${app.data-dir:data}")
    private String dataDir;

    private File file;

    public BookingRepository(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() throws IOException {
        file = new File(dataDir, "bookings.json");
        file.getParentFile().mkdirs();
        if (!file.exists()) {
            file.createNewFile();
            mapper.writeValue(file, List.of());
        }
        load();
    }

    private synchronized void load() throws IOException {
        if (file.length() == 0) return;
        List<Booking> list = mapper.readValue(file, new TypeReference<>() {});
        bookings.clear();
        list.forEach(b -> bookings.put(b.getId(), b));
    }

    private synchronized void save() throws IOException {
        mapper.writeValue(file, new ArrayList<>(bookings.values()));
    }

    public List<Booking> findAll() {
        return new ArrayList<>(bookings.values());
    }

    public Optional<Booking> findById(String id) {
        return Optional.ofNullable(bookings.get(id));
    }

    public List<Booking> findByStudentEmail(String email) {
        return bookings.values().stream()
                .filter(b -> email.equalsIgnoreCase(b.getStudentEmail()))
                .toList();
    }

    public List<Booking> findByTeacherEmail(String email) {
        return bookings.values().stream()
                .filter(b -> email.equalsIgnoreCase(b.getTeacherEmail()))
                .toList();
    }

    public Booking save(Booking booking) throws IOException {
        bookings.put(booking.getId(), booking);
        save();
        return booking;
    }

    public void deleteById(String id) throws IOException {
        bookings.remove(id);
        save();
    }
}
