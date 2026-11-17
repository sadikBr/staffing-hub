package com.brahimsadik.staffinghub.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/** Uses its own MockMvc, without the default test token, to check what anonymous callers can do. */
@TestPropertySource(properties = "staffing.security.allowed-origins=https://staffing.example.com")
class SecurityApiTests extends ApiTestSupport {

    @Autowired
    private WebApplicationContext context;

    private MockMvc anonymous;

    @BeforeEach
    void setUpAnonymousClient() {
        anonymous = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Test
    void apiRequiresAnAccessToken() throws Exception {
        anonymous.perform(get("/api/employees")).andExpect(status().isUnauthorized());
        anonymous.perform(post("/api/roles").contentType(MediaType.APPLICATION_JSON).content("{\"label\": \"X\"}"))
                .andExpect(status().isUnauthorized());
        anonymous.perform(get("/api/employees").with(jwt())).andExpect(status().isOk());
    }

    @Test
    void frontendAndItsConfigurationArePublic() throws Exception {
        anonymous.perform(get("/api/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authEnabled").value(true))
                .andExpect(jsonPath("$.authority").value("https://login.example.test"));
        anonymous.perform(get("/")).andExpect(status().isOk());
        anonymous.perform(get("/employees/123")).andExpect(status().isOk());
    }

    @Test
    void docsAndHealthArePublic() throws Exception {
        anonymous.perform(get("/v3/api-docs")).andExpect(status().isOk());
        anonymous.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
        anonymous.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void allowsConfiguredBrowserOriginsOnly() throws Exception {
        anonymous.perform(options("/api/employees").header("Origin", "https://staffing.example.com")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://staffing.example.com"));
        anonymous.perform(options("/api/employees").header("Origin", "https://evil.example.com")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

}
