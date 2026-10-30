package com.skillswap;

import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.model.*;
import com.skillswap.repository.*;
import com.skillswap.service.AuthService;
import com.skillswap.service.BookingService;
import com.skillswap.service.ChatService;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
public class PersistenceVerificationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private AuthService authService;

    @Test
    @Order(1)
    void testUserRegistrationAndDatabasePersistence() throws Exception {
        String testEmail = "dbtest-" + System.currentTimeMillis() + "@skillswap.edu";
        RegisterRequest req = new RegisterRequest();
        req.setName("Postgres User");
        req.setEmail(testEmail);
        req.setCollege("Stanford University");
        req.setPassword("SecurePass123!");

        AuthResponse regResponse = authService.register(req);
        assertNotNull(regResponse.getId());
        assertEquals("Postgres User", regResponse.getName());

        // Verify entity is immediately saved in database
        User persistedUser = userRepository.findByEmail(testEmail).orElse(null);
        assertNotNull(persistedUser, "User must exist in database");
        assertEquals("Postgres User", persistedUser.getName());
        assertEquals("Stanford University", persistedUser.getCollege());

        // Verify login queries directly from database
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(testEmail);
        loginReq.setPassword("SecurePass123!");

        AuthResponse loginResponse = authService.login(loginReq);
        assertEquals(regResponse.getId(), loginResponse.getId());
        assertEquals("Login successful", loginResponse.getMessage());
    }

    @Test
    @Order(2)
    void testMultipleUsersPreservedWithoutOverwrite() throws Exception {
        long initialCount = userRepository.count();

        RegisterRequest req = new RegisterRequest();
        req.setName("Second DB User");
        req.setEmail("second-" + System.currentTimeMillis() + "@skillswap.edu");
        req.setCollege("MIT");
        req.setPassword("Password999!");

        authService.register(req);
        assertEquals(initialCount + 1, userRepository.count(), "User count must increment by 1");
    }

    @Test
    @Order(3)
    void testAllEntitiesPersistableInPostgres() {
        // Verify Skills repository
        List<Skill> skills = skillRepository.findAll();
        assertNotNull(skills);

        // Verify Bookings repository
        List<Booking> bookings = bookingRepository.findAll();
        assertNotNull(bookings);

        // Verify Messages repository
        List<Message> messages = messageRepository.findAll();
        assertNotNull(messages);

        // Verify Notifications repository
        List<Notification> notifications = notificationRepository.findAll();
        assertNotNull(notifications);

        // Verify Schedules repository
        List<Schedule> schedules = scheduleRepository.findAll();
        assertNotNull(schedules);
    }
}
