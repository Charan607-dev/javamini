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
}
