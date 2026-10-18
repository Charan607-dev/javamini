package com.skillswap;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getAllUsersReturnsOk() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUserByInvalidIdReturns404() throws Exception {
        mockMvc.perform(get("/api/users/nonexistent-user-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getUserByInvalidEmailReturns404() throws Exception {
        mockMvc.perform(get("/api/users/email/nonexistent@user.com"))
                .andExpect(status().isNotFound());
    }
}
