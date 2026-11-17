package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

class EmployeeSkillApiTests extends ApiTestSupport {

    private String employee;
    private String java;
    private String streams;

    @BeforeEach
    void setUp() throws Exception {
        employee = createEmployee("Ada", null);
        java = createLabelled("/api/technologies", "Java");
        streams = create("/api/skills", "{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(java));
    }

    @Test
    void requiresTheSkillsTechnology() throws Exception {
        setLevel(streams, "EXPERT").andExpect(status().isUnprocessableContent());
    }

    @Test
    void addsUpdatesAndRemovesASkill() throws Exception {
        setTechnologies(java).andExpect(status().isOk());

        setLevel(streams, "BEGINNER")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.skills", hasSize(1)))
                .andExpect(jsonPath("$.skills[0].skill.label").value("Streams"))
                .andExpect(jsonPath("$.skills[0].level").value("BEGINNER"));

        setLevel(streams, "EXPERT")
                .andExpect(jsonPath("$.skills", hasSize(1)))
                .andExpect(jsonPath("$.skills[0].level").value("EXPERT"));

        mockMvc.perform(delete("/api/employees/{id}/skills/{skillId}", employee, streams))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/employees/{id}", employee)).andExpect(jsonPath("$.skills", hasSize(0)));
        mockMvc.perform(delete("/api/employees/{id}/skills/{skillId}", employee, streams))
                .andExpect(status().isNotFound());
    }

    @Test
    void removingATechnologyRemovesItsSkills() throws Exception {
        setTechnologies(java);
        setLevel(streams, "ADVANCED").andExpect(status().isOk());

        setTechnologies()
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.technologies", hasSize(0)))
                .andExpect(jsonPath("$.skills", hasSize(0)));
    }

    @Test
    void anAssignedSkillCannotMoveToAnotherTechnology() throws Exception {
        setTechnologies(java);
        setLevel(streams, "ADVANCED");
        final var python = createLabelled("/api/technologies", "Python");

        mockMvc.perform(put("/api/skills/{id}", streams).contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(python)))
                .andExpect(status().isConflict());
    }

    @Test
    void deletingASkillRemovesItFromEmployees() throws Exception {
        setTechnologies(java);
        setLevel(streams, "ADVANCED");

        mockMvc.perform(delete("/api/skills/{id}", streams)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/employees/{id}", employee)).andExpect(jsonPath("$.skills", hasSize(0)));
    }

    private ResultActions setLevel(String skill, String level)
            throws Exception {
        return mockMvc.perform(put("/api/employees/{id}/skills/{skillId}", employee, skill)
                .contentType(MediaType.APPLICATION_JSON).content("{\"level\": \"%s\"}".formatted(level)));
    }

    private ResultActions setTechnologies(String... ids) throws Exception {
        final var json = String.join(", ", Arrays.stream(ids).map("\"%s\""::formatted).toList());
        return mockMvc.perform(put("/api/employees/{id}/technologies", employee)
                .contentType(MediaType.APPLICATION_JSON).content("{\"technologyIds\": [%s]}".formatted(json)));
    }

}
