package com.brahimsadik.staffinghub.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;

import jakarta.persistence.EntityManagerFactory;

/**
 * Guards against N+1 queries: the number of SQL statements an endpoint runs must not grow with the amount of data.
 */
@TestPropertySource(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
class QueryCountTests extends ApiTestSupport {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    private final List<String> roles = new ArrayList<>();
    private final List<String> technologies = new ArrayList<>();
    private final List<String> skills = new ArrayList<>();
    private String customer;
    private String mission;
    private String manager;
    private String someEmployee;

    @Test
    void endpointsRunTheSameNumberOfQueriesWhateverTheDataSize() throws Exception {
        createReferenceData();
        addEmployees(4);
        final var small = measureAll();

        addEmployees(20);
        final var large = measureAll();

        assertThat(large).as("Queries per endpoint with 24 employees vs with 4").isEqualTo(small);
    }

    private Map<String, Long> measureAll() throws Exception {
        final var counts = new LinkedHashMap<String, Long>();
        for (final var endpoint : List.of(
                "/employees?size=100",
                "/employees?size=100&skillId=" + skills.getFirst() + "&minSkillLevel=BEGINNER",
                "/employees/availability?from=2026-01-01&to=2026-12-31&size=100",
                "/employees/" + manager,
                "/employees/" + someEmployee + "/assignments",
                "/missions?size=100",
                "/missions/" + mission,
                "/technologies",
                "/skills",
                "/roles")) {
            counts.put(endpoint, countQueries(endpoint));
        }
        return counts;
    }

    private long countQueries(String endpoint) throws Exception {
        final var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        mockMvc.perform(get(endpoint)).andExpect(status().isOk());
        return statistics.getPrepareStatementCount();
    }

    private void createReferenceData() throws Exception {
        customer = createLabelled("/customers", "ACME");
        for (var i = 0; i < 3; i++) {
            roles.add(createLabelled("/roles", "Role " + i));
            final var technology = createLabelled("/technologies", "Technology " + i);
            technologies.add(technology);
            for (var j = 0; j < 2; j++) {
                skills.add(create("/skills",
                        "{\"label\": \"Skill %d-%d\", \"technologyId\": \"%s\"}".formatted(i, j, technology)));
            }
        }
        manager = createEmployee("Manager", null);
        mission = create("/missions", """
                {"label": "M", "projectName": "P", "status": "ONGOING", "customerId": "%s", "projectManagerId": "%s"}"""
                .formatted(customer, manager));
        for (final var skill : skills.subList(0, 3)) {
            mockMvc.perform(put("/missions/{id}/skills/{skillId}", mission, skill)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"requiredLevel\": \"INTERMEDIATE\"}"));
        }
    }

    /** Each employee: a manager, all roles and technologies, all skills, and two assignments on two missions. */
    private void addEmployees(int count) throws Exception {
        for (var i = 0; i < count; i++) {
            final var employee = createEmployee("Employee", manager);
            if (someEmployee == null) {
                someEmployee = employee;
            }
            putJson("/employees/" + employee + "/roles", "{\"roleIds\": [%s]}".formatted(quotedList(roles)));
            putJson("/employees/" + employee + "/technologies",
                    "{\"technologyIds\": [%s]}".formatted(quotedList(technologies)));
            for (final var skill : skills) {
                putJson("/employees/" + employee + "/skills/" + skill, "{\"level\": \"ADVANCED\"}");
            }
            final var ownMission = create("/missions", """
                    {"label": "M%s", "projectName": "P", "status": "ONGOING", "customerId": "%s"}"""
                    .formatted(employee, customer));
            for (final var target : List.of(mission, ownMission)) {
                mockMvc.perform(post("/missions/{id}/assignments", target).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"employeeId": "%s", "startDate": "2026-01-01", "endDate": "2026-06-30", "rate": 50}"""
                                .formatted(employee)))
                        .andExpect(status().isCreated());
            }
        }
    }

    private void putJson(String path, String json) throws Exception {
        mockMvc.perform(put(path)
                .contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isOk());
    }

    private static String quotedList(List<String> ids) {
        return String.join(", ", ids.stream().map("\"%s\""::formatted).toList());
    }

}
