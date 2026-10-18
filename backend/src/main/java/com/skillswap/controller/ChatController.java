package com.skillswap.controller;

import com.skillswap.dto.MessageRequest;
import com.skillswap.model.Message;
import com.skillswap.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Message>> getMessagesByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(chatService.getMessagesByUserId(userId));
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam String user1,
            @RequestParam String user2) {
        return ResponseEntity.ok(chatService.getConversation(user1, user2));
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestParam(required = false) String senderId,
            @Valid @RequestBody MessageRequest request) throws IOException {
        Message message = chatService.sendMessage(senderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
}
