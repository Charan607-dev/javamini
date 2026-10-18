package com.skillswap.service;

import com.skillswap.dto.MessageRequest;
import com.skillswap.model.Message;
import com.skillswap.model.User;
import com.skillswap.repository.MessageRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public List<Message> getMessagesByUserId(String userId) {
        if (userId == null || userId.isBlank()) return List.of();
        Set<String> aliases = resolveAliases(userId);
        return messageRepository.findAll().stream()
                .filter(m -> matchesAny(m.getSenderId(), m.getSenderEmail(), aliases) ||
                             matchesAny(m.getReceiverId(), m.getReceiverEmail(), aliases))
                .sorted(Comparator.comparing(m -> m.getTimestamp() != null ? m.getTimestamp() : Instant.EPOCH))
                .toList();
    }

    public List<Message> getConversation(String user1, String user2) {
        return getConversation(user1, user2, null);
    }

    public List<Message> getConversation(String user1, String user2, String bookingId) {
        Set<String> user1Aliases = resolveAliases(user1);
        Set<String> user2Aliases = resolveAliases(user2);

        return messageRepository.findAll().stream()
                .filter(m -> {
                    if (bookingId != null && !bookingId.isBlank() && bookingId.equalsIgnoreCase(m.getBookingId())) {
                        return true;
                    }
                    boolean u1ToU2 = matchesAny(m.getSenderId(), m.getSenderEmail(), user1Aliases) &&
                                     matchesAny(m.getReceiverId(), m.getReceiverEmail(), user2Aliases);
                    boolean u2ToU1 = matchesAny(m.getSenderId(), m.getSenderEmail(), user2Aliases) &&
                                     matchesAny(m.getReceiverId(), m.getReceiverEmail(), user1Aliases);
                    return u1ToU2 || u2ToU1;
                })
                .sorted(Comparator.comparing(m -> m.getTimestamp() != null ? m.getTimestamp() : Instant.EPOCH))
                .toList();
    }

    public List<Message> getMessagesByBookingId(String bookingId) {
        return messageRepository.findByBookingId(bookingId);
    }

    public Message sendMessage(String senderIdParam, MessageRequest request) throws IOException {
        if (request == null) {
            throw new IllegalArgumentException("Message request cannot be null");
        }

        String sid = senderIdParam != null && !senderIdParam.isBlank()
                ? senderIdParam
                : (request.getSenderId() != null && !request.getSenderId().isBlank()
                    ? request.getSenderId()
                    : request.getSenderEmail());

        if (sid == null || sid.isBlank()) {
            throw new IllegalArgumentException("Sender identifier (ID or email) is required");
        }

        String rid = request.getReceiverId() != null && !request.getReceiverId().isBlank()
                ? request.getReceiverId()
                : request.getReceiverEmail();

        if (rid == null || rid.isBlank()) {
            throw new IllegalArgumentException("Receiver identifier (ID or email) is required");
        }

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setContent(request.getContent().trim());
        message.setTimestamp(Instant.now());
        message.setBookingId(request.getBookingId() != null && !request.getBookingId().isBlank() ? request.getBookingId() : null);

        // Resolve sender details
        User senderUser = findUser(sid);
        if (senderUser != null) {
            message.setSenderId(senderUser.getId());
            message.setSenderEmail(senderUser.getEmail());
            message.setSenderName(senderUser.getName());
        } else {
            message.setSenderId(sid);
            if (request.getSenderEmail() != null) message.setSenderEmail(request.getSenderEmail());
            if (request.getSenderName() != null) message.setSenderName(request.getSenderName());
        }

        // Resolve receiver details
        User receiverUser = findUser(rid);
        if (receiverUser != null) {
            message.setReceiverId(receiverUser.getId());
            message.setReceiverEmail(receiverUser.getEmail());
        } else {
            message.setReceiverId(rid);
            if (request.getReceiverEmail() != null) message.setReceiverEmail(request.getReceiverEmail());
        }

        return messageRepository.save(message);
    }

    private User findUser(String identifier) {
        if (identifier == null || identifier.isBlank()) return null;
        String trimmed = identifier.trim();
        return userRepository.findById(trimmed)
                .or(() -> userRepository.findByEmail(trimmed))
                .orElse(null);
    }

    private Set<String> resolveAliases(String identifier) {
        Set<String> set = new HashSet<>();
        if (identifier == null || identifier.isBlank()) return set;
        String trimmed = identifier.trim().toLowerCase();
        set.add(trimmed);
        User user = findUser(identifier);
        if (user != null) {
            if (user.getId() != null) set.add(user.getId().toLowerCase());
            if (user.getEmail() != null) set.add(user.getEmail().toLowerCase());
        }
        return set;
    }

    private boolean matchesAny(String id, String email, Set<String> aliases) {
        if (id != null && aliases.contains(id.toLowerCase())) return true;
        if (email != null && aliases.contains(email.toLowerCase())) return true;
        return false;
    }
}
