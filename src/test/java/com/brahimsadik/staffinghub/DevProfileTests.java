package com.brahimsadik.staffinghub;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** The dev profile loads the demo data and needs no login. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Import(TestcontainersConfiguration.class)
class DevProfileTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void loadsDemoDataAndNeedsNoLogin() throws Exception {
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM employees", Integer.class)).isEqualTo(12);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM mission_assignments", Integer.class))
                .isEqualTo(10);

        // No token: the default test JWT is not configured for this class.
        mockMvc.perform(get("/employees")).andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(11)); // one former employee is hidden
        mockMvc.perform(get("/missions/00000000-0000-0000-0006-000000000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignments.length()", greaterThan(0)));
    }

}
