package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.User;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class UserRepository {

    private final ObjectMapper mapper;
    private final Map<String, User> users = new ConcurrentHashMap<>();

    @Value("${app.data-dir:data}")
    private String dataDir;

    private File file;

    public UserRepository(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() throws IOException {
        file = new File(dataDir, "users.json");
        file.getParentFile().mkdirs();
        if (!file.exists()) {
            file.createNewFile();
            mapper.writeValue(file, List.of());
        }
        load();
    }

    private synchronized void load() throws IOException {
        if (file.length() == 0) return;
        List<User> list = mapper.readValue(file, new TypeReference<>() {});
        users.clear();
        list.forEach(u -> users.put(u.getId(), u));
    }

    private synchronized void save() throws IOException {
        mapper.writeValue(file, new ArrayList<>(users.values()));
    }

    public List<User> findAll() {
        return new ArrayList<>(users.values());
    }

    public Optional<User> findById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    public Optional<User> findByEmail(String email) {
        return users.values().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    public User save(User user) throws IOException {
        users.put(user.getId(), user);
        save();
        return user;
    }

    public void deleteById(String id) throws IOException {
        users.remove(id);
        save();
    }
}
