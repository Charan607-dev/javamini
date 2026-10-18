package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.LoginRequest;
import com.skillswap.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerAndLogin() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Test User");
        reg.setEmail("test-" + System.currentTimeMillis() + "@example.com");
        reg.setPassword("secret123");
        reg.setCollege("Test University");

        // Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.password").doesNotExist());

        // Login
        LoginRequest login = new LoginRequest();
        login.setEmail(reg.getEmail());
        login.setPassword("secret123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void loginWithWrongPasswordReturns404() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("nonexistent@example.com");
        login.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isNotFound());
    }
}
