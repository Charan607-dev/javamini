package com.skillswap.service;

import com.skillswap.model.Notification;
import com.skillswap.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    public Notification createNotification(String userId, String message) throws IOException {
        Notification notification = new Notification(userId, message);
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(String id) throws IOException {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new com.skillswap.exception.ResourceNotFoundException("Notification not found: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
