package com.skillswap.config;

import com.skillswap.model.Skill;
import com.skillswap.model.User;
import com.skillswap.repository.SkillRepository;
import com.skillswap.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo data on first startup when the JSON files are empty.
 * Safe for repeated restarts: only inserts if the repository is empty,
 * so existing user-created data is never overwritten or duplicated.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public DataInitializer(UserRepository userRepository,
                           SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedSkills();
    }

    private void seedUsers() throws Exception {
        if (!userRepository.findAll().isEmpty()) {
            log.info("Users already exist – skipping seed.");
            return;
        }

        log.info("Seeding demo users...");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password123");

        userRepository.save(new User("Alice Johnson", "alice@college.edu", "MIT", hash));
        userRepository.save(new User("Bob Smith", "bob@college.edu", "Harvard", hash));
        userRepository.save(new User("Charlie Davis", "charlie@college.edu", "Stanford", hash));
        userRepository.save(new User("Diana Martinez", "diana@college.edu", "UC Berkeley", hash));

        log.info("Seeded 4 demo users.");
    }

    private void seedSkills() throws Exception {
        if (!skillRepository.findAll().isEmpty()) {
            log.info("Skills already exist – skipping seed.");
            return;
        }

        // We need the users to exist so we can look them up
        var alice = userRepository.findByEmail("alice@college.edu");
        var bob = userRepository.findByEmail("bob@college.edu");
        var charlie = userRepository.findByEmail("charlie@college.edu");
        var diana = userRepository.findByEmail("diana@college.edu");

        if (alice.isEmpty() || bob.isEmpty() || charlie.isEmpty() || diana.isEmpty()) {
            log.warn("Demo users missing – cannot seed skills.");
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

        log.info("Seeded 4 demo skills.");
    }
}
