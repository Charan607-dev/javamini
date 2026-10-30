package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.AuthResponse;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import com.skillswap.model.User;
import com.skillswap.repository.JsonPersistenceHelper;
import com.skillswap.repository.UserRepository;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class PersistenceVerificationTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testJsonPersistenceLifecycle(@TempDir Path tempDir) throws Exception {
        String testDataDir = tempDir.toAbsolutePath().toString();

        // 1. Initialize repository with temporary directory
        UserRepository repo1 = new UserRepository(objectMapper);
        ReflectionTestUtils.setField(repo1, "dataDir", testDataDir);
        repo1.init();

        File usersFile = new File(testDataDir, "users.json");
        assertTrue(usersFile.exists(), "users.json file should be created");

        // 2. Register first user and verify file content on disk
        User user1 = new User("User One", "user1@example.com", "College A", "passhash1");
        repo1.save(user1);

        assertTrue(usersFile.length() > 0, "users.json should not be 0 bytes");
        List<User> listAfterFirst = JsonPersistenceHelper.loadList(usersFile, objectMapper, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        assertEquals(1, listAfterFirst.size());
        assertEquals("user1@example.com", listAfterFirst.get(0).getEmail());

        // 3. Register second user and verify both are preserved
        User user2 = new User("User Two", "user2@example.com", "College B", "passhash2");
        repo1.save(user2);

        List<User> listAfterSecond = JsonPersistenceHelper.loadList(usersFile, objectMapper, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        assertEquals(2, listAfterSecond.size());
        assertTrue(listAfterSecond.stream().anyMatch(u -> u.getEmail().equals("user1@example.com")));
        assertTrue(listAfterSecond.stream().anyMatch(u -> u.getEmail().equals("user2@example.com")));

        // 4. Simulate server restart: create brand-new UserRepository instance pointed at same directory
        UserRepository repoRestarted = new UserRepository(objectMapper);
        ReflectionTestUtils.setField(repoRestarted, "dataDir", testDataDir);
        repoRestarted.init(); // loads from users.json

        // 5. Verify retrieved data after restart
        assertEquals(2, repoRestarted.findAll().size(), "Both users should be loaded after restart");
        assertTrue(repoRestarted.findByEmail("user1@example.com").isPresent(), "First user must be retrievable");
        assertTrue(repoRestarted.findByEmail("user2@example.com").isPresent(), "Second user must be retrievable");

        // 6. Register a third user on restarted instance
        User user3 = new User("User Three", "user3@example.com", "College C", "passhash3");
        repoRestarted.save(user3);

        List<User> listAfterThird = JsonPersistenceHelper.loadList(usersFile, objectMapper, new com.fasterxml.jackson.core.type.TypeReference<>() {});
        assertEquals(3, listAfterThird.size());
        assertTrue(listAfterThird.stream().anyMatch(u -> u.getEmail().equals("user1@example.com")));
        assertTrue(listAfterThird.stream().anyMatch(u -> u.getEmail().equals("user2@example.com")));
        assertTrue(listAfterThird.stream().anyMatch(u -> u.getEmail().equals("user3@example.com")));
    }
}
