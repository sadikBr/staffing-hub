package com.brahimsadik.staffinghub;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;

import com.brahimsadik.staffinghub.config.AppRole;

/**
 * Every MockMvc request is sent as an authenticated admin (with a test JWT), so API tests focus on behaviour.
 * {@code SecurityApiTests} checks what happens without a token and with lesser roles.
 */
@TestConfiguration(proxyBeanMethods = false)
public class SecurityTestConfiguration {

    /** Never contacted: test requests carry an already-decoded JWT. */
    public static final String TEST_ISSUER_PROPERTY = "staffing.security.issuer-uri=https://login.example.test";

    @Bean
    MockMvcBuilderCustomizer authenticateEveryRequest() {
        return builder -> builder.defaultRequest(get("/").with(asRole(AppRole.ADMIN)));
    }

    /** A test JWT with the authorities of the role (as {@code RoleClaimConverter} would give them). */
    public static JwtRequestPostProcessor asRole(AppRole role) {
        return jwt().authorities(role.authorities().stream().<GrantedAuthority>map(SimpleGrantedAuthority::new).toList());
    }

}
