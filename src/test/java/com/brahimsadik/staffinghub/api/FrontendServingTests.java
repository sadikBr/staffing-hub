package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

/** The frontend is served by the same application (a test index.html stands in for the real build). */
class FrontendServingTests extends ApiTestSupport {

    @Test
    void servesTheFrontendForItsOwnRoutes() throws Exception {
        // "/" is forwarded to index.html by Spring Boot's welcome page support.
        mockMvc.perform(get("/")).andExpect(status().isOk()).andExpect(forwardedUrl("index.html"));

        for (final var route : new String[] { "/employees", "/employees/0c6f1d9e-0000-0000-0000-000000000000",
                "/missions/abc/assignments" }) {
            mockMvc.perform(get(route))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("test frontend")))
                    .andExpect(header().string("Cache-Control", containsString("no-cache")));
        }
    }

    @Test
    void unknownApiAndAssetPathsStayNotFound() throws Exception {
        mockMvc.perform(get("/api/does-not-exist")).andExpect(status().isNotFound());
        mockMvc.perform(get("/assets/missing.js")).andExpect(status().isNotFound());
    }

    @Test
    void apiStillServesJson() throws Exception {
        mockMvc.perform(get("/api/employees")).andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"));
    }

}
