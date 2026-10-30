package com.skillswap.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.*;
import com.skillswap.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.InputStream;
import java.util.List;
import java.util.concurrent.Executors;

/**
 * Seeds and migrates data into PostgreSQL.
 *
 * IMPORTANT: This runs on a BACKGROUND THREAD triggered by ApplicationReadyEvent,
 * NOT as a CommandLineRunner. This ensures Tomcat has already bound its port before
 * any remote database queries are made, preventing Render's port-scan timeout.
 *
 * Idempotent: skips seeding if the database table already has rows.
 */
@Component
public class DataInitializer implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final BookingRepository bookingRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final ScheduleRepository scheduleRepository;
    private final ObjectMapper mapper;

    public DataInitializer(UserRepository userRepository,
                           SkillRepository skillRepository,
                           BookingRepository bookingRepository,
                           MessageRepository messageRepository,
                           NotificationRepository notificationRepository,
                           ScheduleRepository scheduleRepository,
                           ObjectMapper mapper) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.bookingRepository = bookingRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.scheduleRepository = scheduleRepository;
        this.mapper = mapper;
    }

    /**
     * Called after Tomcat has fully started and bound its port.
     * Database seeding runs on a background thread so startup is non-blocking.
     */
    @Override
    public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
        Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "data-initializer");
            t.setDaemon(true);
            return t;
        }).execute(() -> {
            try {
                log.info("=== DataInitializer: starting background seed/migration ===");
                migrateUsers();
                migrateSkills();
                migrateBookings();
                migrateMessages();
                migrateNotifications();
                migrateSchedules();
                log.info("=== DataInitializer: seed/migration complete ===");
            } catch (Exception e) {
                // Log but never crash the app – the service is already healthy
                log.error("DataInitializer encountered an error during seeding (non-fatal): {}", e.getMessage(), e);
            }
        });
    }

    private void migrateUsers() {
        if (userRepository.count() > 0) {
            log.info("Users table already populated – skipping seed.");
            return;
        }

        List<User> jsonUsers = loadFromJson("users.json", new TypeReference<List<User>>() {});
        if (jsonUsers != null && !jsonUsers.isEmpty()) {
            log.info("Migrating {} users from JSON to PostgreSQL...", jsonUsers.size());
            for (User u : jsonUsers) {
                if (u.getEmail() != null && userRepository.findByEmail(u.getEmail()).isEmpty()) {
                    userRepository.save(u);
                }
            }
            log.info("User migration complete. Total in DB: {}", userRepository.count());
            return;
        }

        log.info("No JSON users found – seeding demo users...");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password123");
        userRepository.save(new User("Alice Johnson", "alice@college.edu", "MIT", hash));
        userRepository.save(new User("Bob Smith", "bob@college.edu", "Harvard", hash));
        userRepository.save(new User("Charlie Davis", "charlie@college.edu", "Stanford", hash));
        userRepository.save(new User("Diana Martinez", "diana@college.edu", "UC Berkeley", hash));
        log.info("Seeded 4 demo users into PostgreSQL.");
    }

    private void migrateSkills() {
        if (skillRepository.count() > 0) {
            log.info("Skills table already populated – skipping seed.");
            return;
        }

        List<Skill> jsonSkills = loadFromJson("skills.json", new TypeReference<List<Skill>>() {});
        if (jsonSkills != null && !jsonSkills.isEmpty()) {
            log.info("Migrating {} skills from JSON to PostgreSQL...", jsonSkills.size());
            for (Skill s : jsonSkills) {
                if (s.getId() != null && skillRepository.findById(s.getId()).isEmpty()) {
                    skillRepository.save(s);
                }
            }
            log.info("Skills migration complete. Total in DB: {}", skillRepository.count());
            return;
        }

        var alice   = userRepository.findByEmail("alice@college.edu");
        var bob     = userRepository.findByEmail("bob@college.edu");
        var charlie = userRepository.findByEmail("charlie@college.edu");
        var diana   = userRepository.findByEmail("diana@college.edu");

        if (alice.isEmpty() || bob.isEmpty() || charlie.isEmpty() || diana.isEmpty()) {
            log.warn("Demo users missing – cannot seed demo skills.");
            return;
        }

        skillRepository.save(new Skill(
                alice.get().getEmail(), alice.get().getName(),
                "Java & Spring Boot 3", "Technology",
                "Full stack backend development, REST APIs, and microservices architecture.",
                "Advanced", "Figma & UI Design"
        ));
        skillRepository.save(new Skill(
                bob.get().getEmail(), bob.get().getName(),
                "Figma & UI Design", "Design",
                "Wireframing, interactive prototypes, and design systems.",
                "Intermediate", "Java & Spring Boot 3"
        ));
        skillRepository.save(new Skill(
                charlie.get().getEmail(), charlie.get().getName(),
                "Data Structures & Python", "Technology",
                "Binary search trees, graphs, dynamic programming, and technical interview prep.",
                "Advanced", "Conversational Spanish"
        ));
        skillRepository.save(new Skill(
                diana.get().getEmail(), diana.get().getName(),
                "Conversational Spanish", "Languages",
                "Interactive conversation practice, grammar fundamentals, and pronunciation.",
                "Intermediate", "Data Structures & Python"
        ));
        log.info("Seeded 4 demo skills into PostgreSQL.");
    }

    private void migrateBookings() {
        if (bookingRepository.count() > 0) return;
        List<Booking> list = loadFromJson("bookings.json", new TypeReference<List<Booking>>() {});
        if (list != null && !list.isEmpty()) {
            log.info("Migrating {} bookings from JSON...", list.size());
            for (Booking b : list) {
                if (b.getId() != null && bookingRepository.findById(b.getId()).isEmpty()) {
                    bookingRepository.save(b);
                }
            }
        }
    }

    private void migrateMessages() {
        if (messageRepository.count() > 0) return;
        List<Message> list = loadFromJson("messages.json", new TypeReference<List<Message>>() {});
        if (list != null && !list.isEmpty()) {
            log.info("Migrating {} messages from JSON...", list.size());
            for (Message m : list) {
                if (m.getId() != null && messageRepository.findById(m.getId()).isEmpty()) {
                    messageRepository.save(m);
                }
            }
        }
    }

    private void migrateNotifications() {
        if (notificationRepository.count() > 0) return;
        List<Notification> list = loadFromJson("notifications.json", new TypeReference<List<Notification>>() {});
        if (list != null && !list.isEmpty()) {
            log.info("Migrating {} notifications from JSON...", list.size());
            for (Notification n : list) {
                if (n.getId() != null && notificationRepository.findById(n.getId()).isEmpty()) {
                    notificationRepository.save(n);
                }
            }
        }
    }

    private void migrateSchedules() {
        if (scheduleRepository.count() > 0) return;
        List<Schedule> list = loadFromJson("schedules.json", new TypeReference<List<Schedule>>() {});
        if (list != null && !list.isEmpty()) {
            log.info("Migrating {} schedules from JSON...", list.size());
            for (Schedule s : list) {
                if (s.getId() != null && scheduleRepository.findById(s.getId()).isEmpty()) {
                    scheduleRepository.save(s);
                }
            }
        }
    }

    private <T> List<T> loadFromJson(String filename, TypeReference<List<T>> typeRef) {
        try {
            File localFile = new File("data", filename);
            if (!localFile.exists()) {
                localFile = new File("backend/data", filename);
            }
            if (localFile.exists() && localFile.length() > 0) {
                return mapper.readValue(localFile, typeRef);
            }
            ClassPathResource cp = new ClassPathResource("data/" + filename);
            if (cp.exists()) {
                try (InputStream is = cp.getInputStream()) {
                    return mapper.readValue(is, typeRef);
                }
            }
        } catch (Exception e) {
            log.warn("Could not read JSON file {} for migration: {}", filename, e.getMessage());
        }
        return List.of();
    }
}
