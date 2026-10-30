package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.Notification;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class NotificationRepository {

    private final ObjectMapper mapper;
    private final Map<String, Notification> notifications = new ConcurrentHashMap<>();

    @Value("${app.data-dir:data}")
    private String dataDir;

    private File file;

    public NotificationRepository(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() throws IOException {
        file = JsonPersistenceHelper.resolveFile(dataDir, "notifications.json");
        load();
    }

    private synchronized void load() throws IOException {
        List<Notification> list = JsonPersistenceHelper.loadList(file, mapper, new TypeReference<>() {});
        notifications.clear();
        list.forEach(n -> notifications.put(n.getId(), n));
    }

    private synchronized void save() throws IOException {
        JsonPersistenceHelper.saveListAtomically(file, mapper, new ArrayList<>(notifications.values()));
    }

    public List<Notification> findByUserId(String userId) {
        return notifications.values().stream()
                .filter(n -> userId.equals(n.getUserId()))
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .toList();
    }

    public Notification save(Notification notification) throws IOException {
        notifications.put(notification.getId(), notification);
        save();
        return notification;
    }

    public Optional<Notification> findById(String id) {
        return Optional.ofNullable(notifications.get(id));
    }
}
