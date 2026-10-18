package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.Message;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class MessageRepository {

    private final ObjectMapper mapper;
    private final Map<String, Message> messages = new ConcurrentHashMap<>();

    @Value("${app.data-dir:data}")
    private String dataDir;

    private File file;

    public MessageRepository(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() throws IOException {
        file = new File(dataDir, "messages.json");
        if (file.getParentFile() != null) {
            file.getParentFile().mkdirs();
        }
        if (!file.exists()) {
            file.createNewFile();
            mapper.writeValue(file, List.of());
        }
        load();
    }

    private synchronized void load() throws IOException {
        if (file.length() == 0) return;
        List<Message> list = mapper.readValue(file, new TypeReference<>() {});
        messages.clear();
        list.forEach(m -> messages.put(m.getId(), m));
    }

    private synchronized void save() throws IOException {
        mapper.writeValue(file, new ArrayList<>(messages.values()));
    }

    public List<Message> findAll() {
        return new ArrayList<>(messages.values());
    }

    /**
     * Returns all messages where the user is sender or receiver.
     */
    public List<Message> findByUserId(String userId) {
        return messages.values().stream()
                .filter(m -> userId.equals(m.getSenderId()) || userId.equals(m.getReceiverId()))
                .toList();
    }

    /**
     * Returns messages between two users.
     */
    public List<Message> findConversation(String userId1, String userId2) {
        return messages.values().stream()
                .filter(m ->
                        (userId1.equals(m.getSenderId()) && userId2.equals(m.getReceiverId())) ||
                        (userId2.equals(m.getSenderId()) && userId1.equals(m.getReceiverId())))
                .sorted(Comparator.comparing(Message::getTimestamp))
                .toList();
    }

    public List<Message> findByConversation(String userId1, String userId2) {
        return findConversation(userId1, userId2);
    }

    public Message save(Message message) throws IOException {
        messages.put(message.getId(), message);
        save();
        return message;
    }
}
