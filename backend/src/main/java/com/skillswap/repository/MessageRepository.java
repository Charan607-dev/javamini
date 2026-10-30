package com.skillswap.repository;

import com.skillswap.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("SELECT m FROM Message m WHERE m.senderId = :userId OR m.receiverId = :userId ORDER BY m.timestamp ASC")
    List<Message> findByUserId(@Param("userId") String userId);

    @Query("SELECT m FROM Message m WHERE (LOWER(m.senderId) = LOWER(:u1) AND LOWER(m.receiverId) = LOWER(:u2)) " +
           "OR (LOWER(m.senderId) = LOWER(:u2) AND LOWER(m.receiverId) = LOWER(:u1)) ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("u1") String u1, @Param("u2") String u2);

    default List<Message> findByConversation(String userId1, String userId2) {
        return findConversation(userId1, userId2);
    }

    List<Message> findByBookingIdOrderByTimestampAsc(String bookingId);

    default List<Message> findByBookingId(String bookingId) {
        if (bookingId == null || bookingId.isBlank()) return List.of();
        return findByBookingIdOrderByTimestampAsc(bookingId);
    }
}
