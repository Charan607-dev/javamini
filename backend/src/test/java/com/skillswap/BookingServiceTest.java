package com.skillswap;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BookingServiceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper mapper;

    @Test
    void getAllBookingsReturnsOk() throws Exception {
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk());
    }

    @Test
    void getBookingByInvalidIdReturns404() throws Exception {
        mockMvc.perform(get("/api/bookings/nonexistent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void rescheduleBookingAndAcceptWorkflow() throws Exception {
        com.skillswap.dto.RescheduleRequest req = new com.skillswap.dto.RescheduleRequest();
        req.setProposedDate("2026-11-15");
        req.setProposedTime("15:30");
        req.setRescheduleProposedBy("alice@college.edu");

        // Reschedule
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/bookings/bdc964a8-306c-43b2-ba12-8b6e98af10a7/reschedule")
                        .param("userIdentifier", "alice@college.edu")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value("Postponed"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.proposedDate").value("2026-11-15"));

        // Proposer cannot accept own proposal
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/bookings/bdc964a8-306c-43b2-ba12-8b6e98af10a7/reschedule/accept")
                        .param("userIdentifier", "alice@college.edu"))
                .andExpect(status().isBadRequest());

        // Partner (bob) accepts proposal
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/bookings/bdc964a8-306c-43b2-ba12-8b6e98af10a7/reschedule/accept")
                        .param("userIdentifier", "bob@college.edu"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.status").value("Accepted"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.date").value("2026-11-15"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.time").value("15:30"));
    }

    @Test
    void reschedulePastDateReturnsBadRequest() throws Exception {
        com.skillswap.dto.RescheduleRequest req = new com.skillswap.dto.RescheduleRequest();
        req.setProposedDate("2020-01-01");
        req.setProposedTime("10:00");
        req.setRescheduleProposedBy("alice@college.edu");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/bookings/bdc964a8-306c-43b2-ba12-8b6e98af10a7/reschedule")
                        .param("userIdentifier", "alice@college.edu")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
