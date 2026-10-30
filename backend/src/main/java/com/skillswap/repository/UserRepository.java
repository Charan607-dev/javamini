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
        file = JsonPersistenceHelper.resolveFile(dataDir, "users.json");
        load();
    }

    private synchronized void load() throws IOException {
        List<User> list = JsonPersistenceHelper.loadList(file, mapper, new TypeReference<>() {});
        users.clear();
        list.forEach(u -> users.put(u.getId(), u));
    }

    private synchronized void save() throws IOException {
        JsonPersistenceHelper.saveListAtomically(file, mapper, new ArrayList<>(users.values()));
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
