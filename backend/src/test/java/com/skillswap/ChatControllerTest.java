package com.skillswap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.dto.MessageRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void sendMessageSuccessAndRetrieveConversation() throws Exception {
        MessageRequest request = new MessageRequest();
        request.setSenderId("alice@college.edu");
        request.setReceiverId("bob@college.edu");
        request.setContent("Testing chat message end to end");
        request.setBookingId("bdc964a8-306c-43b2-ba12-8b6e98af10a7");

        mockMvc.perform(post("/api/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.content").value("Testing chat message end to end"));

        mockMvc.perform(get("/api/messages/conversation")
                        .param("user1", "alice@college.edu")
                        .param("user2", "bob@college.edu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void sendEmptyMessageReturnsBadRequest() throws Exception {
        MessageRequest request = new MessageRequest();
        request.setSenderId("alice@college.edu");
        request.setReceiverId("bob@college.edu");
        request.setContent("   ");

        mockMvc.perform(post("/api/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
