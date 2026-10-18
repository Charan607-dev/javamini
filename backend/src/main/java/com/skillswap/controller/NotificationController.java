package com.skillswap.controller;

import com.skillswap.model.Notification;
import com.skillswap.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, String> body) throws IOException {
        String userId = body.get("userId");
        String message = body.get("message");
        if (message == null && body.containsKey("title")) {
            message = body.get("title");
        }
        Notification notification = notificationService.createNotification(userId, message != null ? message : "");
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsReadPatch(@PathVariable String id) throws IOException {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsReadPut(@PathVariable String id) throws IOException {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
}
