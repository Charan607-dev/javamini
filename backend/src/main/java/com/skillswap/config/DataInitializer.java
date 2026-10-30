package com.skillswap.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.model.*;
import com.skillswap.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.InputStream;
import java.util.List;

/**
 * Seeds and migrates data into PostgreSQL on startup:
 * 1. Checks if database already contains users/skills/etc.
 * 2. Migrates existing records from backend/data/*.json (or classpath /data/*.json)
 * 3. If no JSON data exists or database is blank, seeds initial demo users and skills.
 * 4. Safe and idempotent for repeated restarts: avoids duplicates using email / ID checks.
 */
@Component
public class DataInitializer implements CommandLineRunner {

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

    @Override
    public void run(String... args) throws Exception {
        migrateUsers();
        migrateSkills();
        migrateBookings();
        migrateMessages();
        migrateNotifications();
        migrateSchedules();
    }

    private void migrateUsers() {
        if (userRepository.count() > 0) {
            log.info("Database users table already populated ({} users) – skipping seed.", userRepository.count());
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

        log.info("No JSON users found; seeding demo users...");
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
            log.info("Database skills table already populated ({} skills) – skipping seed.", skillRepository.count());
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

        var alice = userRepository.findByEmail("alice@college.edu");
        var bob = userRepository.findByEmail("bob@college.edu");
        var charlie = userRepository.findByEmail("charlie@college.edu");
        var diana = userRepository.findByEmail("diana@college.edu");

        if (alice.isEmpty() || bob.isEmpty() || charlie.isEmpty() || diana.isEmpty()) {
            log.warn("Demo users missing – cannot seed demo skills.");
            return;
        }

        log.info("Seeding demo skills...");
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
            log.info("Migrating {} bookings from JSON to PostgreSQL...", list.size());
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
            log.info("Migrating {} messages from JSON to PostgreSQL...", list.size());
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
            log.info("Migrating {} notifications from JSON to PostgreSQL...", list.size());
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
            log.info("Migrating {} schedules from JSON to PostgreSQL...", list.size());
            for (Schedule s : list) {
                if (s.getId() != null && scheduleRepository.findById(s.getId()).isEmpty()) {
                    scheduleRepository.save(s);
                }
            }
        }
    }

    private <T> List<T> loadFromJson(String filename, TypeReference<List<T>> typeRef) {
        try {
            // Check file in local "data/" directory or "backend/data/"
            File localFile = new File("data", filename);
            if (!localFile.exists()) {
                localFile = new File("backend/data", filename);
            }
            if (localFile.exists() && localFile.length() > 0) {
                return mapper.readValue(localFile, typeRef);
            }

            // Fallback to classpath
            ClassPathResource cp = new ClassPathResource("data/" + filename);
            if (cp.exists()) {
                try (InputStream is = cp.getInputStream()) {
                    return mapper.readValue(is, typeRef);
                }
            }
        } catch (Exception e) {
            log.warn("Could not read JSON file {} for database migration: {}", filename, e.getMessage());
        }
        return List.of();
    }
}
