package com.skillswap.service;

import com.skillswap.dto.MessageRequest;
import com.skillswap.model.Message;
import com.skillswap.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private final MessageRepository messageRepository;

    public ChatService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<Message> getMessagesByUserId(String userId) {
        return messageRepository.findByUserId(userId);
    }

    public List<Message> getConversation(String user1, String user2) {
        return messageRepository.findByConversation(user1, user2);
    }

    public Message sendMessage(String senderId, MessageRequest request) throws IOException {
        String sid = senderId != null && !senderId.isBlank() ? senderId : (request != null ? request.getSenderId() : null);
        if (sid == null || sid.isBlank()) {
            throw new IllegalArgumentException("Sender ID is required");
        }

        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setSenderId(sid);
        message.setReceiverId(request.getReceiverId());
        message.setContent(request.getContent().trim());
        message.setTimestamp(Instant.now());

        return messageRepository.save(message);
    }
}
