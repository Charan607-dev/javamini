package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.Skill;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class SkillRepository {

    private final ObjectMapper mapper;
    private final Map<String, Skill> skills = new ConcurrentHashMap<>();

    @Value("${app.data-dir:data}")
    private String dataDir;

    private File file;

    public SkillRepository(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() throws IOException {
        file = new File(dataDir, "skills.json");
        file.getParentFile().mkdirs();
        if (!file.exists()) {
            file.createNewFile();
            mapper.writeValue(file, List.of());
        }
        load();
    }

    private synchronized void load() throws IOException {
        if (file.length() == 0) return;
        List<Skill> list = mapper.readValue(file, new TypeReference<>() {});
        skills.clear();
        list.forEach(s -> skills.put(s.getId(), s));
    }

    private synchronized void save() throws IOException {
        mapper.writeValue(file, new ArrayList<>(skills.values()));
    }

    public List<Skill> findAll() {
        return new ArrayList<>(skills.values());
    }

    public Optional<Skill> findById(String id) {
        return Optional.ofNullable(skills.get(id));
    }

    public List<Skill> findByOwnerEmail(String email) {
        return skills.values().stream()
                .filter(s -> s.getOwnerEmail().equalsIgnoreCase(email))
                .toList();
    }

    public Skill save(Skill skill) throws IOException {
        skills.put(skill.getId(), skill);
        save();
        return skill;
    }

    public void deleteById(String id) throws IOException {
        skills.remove(id);
        save();
    }
}
