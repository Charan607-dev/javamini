package com.skillswap.repository;

import com.skillswap.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    default List<Notification> findByUserId(String userId) {
        if (userId == null) return List.of();
        return findByUserIdOrderByCreatedAtDesc(userId);
    }
}
