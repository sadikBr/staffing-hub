package com.brahimsadik.staffinghub;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;

/**
 * Every MockMvc request is sent as an authenticated user (with a test JWT), so API tests focus on behaviour.
 * {@code SecurityApiTests} checks what happens without a token.
 */
@TestConfiguration(proxyBeanMethods = false)
public class SecurityTestConfiguration {

    /** Never contacted: test requests carry an already-decoded JWT. */
    public static final String TEST_ISSUER_PROPERTY = "staffing.security.issuer-uri=https://login.example.test";

    @Bean
    MockMvcBuilderCustomizer authenticateEveryRequest() {
        return builder -> builder.defaultRequest(get("/").with(jwt()));
    }

}
