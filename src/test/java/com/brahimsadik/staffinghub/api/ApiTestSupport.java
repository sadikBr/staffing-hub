package com.brahimsadik.staffinghub.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.brahimsadik.staffinghub.TestcontainersConfiguration;
import com.jayway.jsonpath.JsonPath;

/** Full-stack tests: real HTTP layer, real services, real PostgreSQL (via Testcontainers), cleaned before each test. */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
abstract class ApiTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute("""
                TRUNCATE mission_assignments, missions_skills, missions, employees_skills, employees_technologies,
                         employees_roles, employees, skills, technologies, roles, customers CASCADE""");
    }

    /** POSTs the JSON body, expects 201 Created, and returns the new resource's id. */
    protected String create(String path, String json) throws Exception {
        final var body = mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    protected String createLabelled(String path, String label) throws Exception {
        return create(path, "{\"label\": \"%s\"}".formatted(label));
    }

    protected String createEmployee(String firstName, String managerId) throws Exception {
        return create("/employees", employeeJson(firstName, managerId));
    }

    protected static String employeeJson(String firstName, String managerId) {
        final var manager = managerId == null ? "" : ", \"managerId\": \"%s\"".formatted(managerId);
        return """
                {"firstName": "%s", "lastName": "Doe", "seniority": "SENIOR", "community": "OWL"%s}"""
                .formatted(firstName, manager);
    }

    protected static String employeeJson(String firstName, String lastName, String seniority, String community,
            String departureDate) {
        return """
                {"firstName": "%s", "lastName": "%s", "seniority": "%s", "community": "%s", "departureDate": %s}"""
                .formatted(firstName, lastName, seniority, community,
                        departureDate == null ? "null" : "\"" + departureDate + "\"");
    }

    protected static String quoted(String value) {
        return value == null ? "null" : "\"" + value + "\"";
    }

}
