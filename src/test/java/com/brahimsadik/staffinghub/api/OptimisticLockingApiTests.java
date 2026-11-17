package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** Updates sent with a stale version are refused instead of silently overwriting someone else's change. */
class OptimisticLockingApiTests extends ApiTestSupport {

    @ParameterizedTest
    @ValueSource(strings = { "/customers", "/roles", "/technologies" })
    void refusesUpdatesBasedOnAStaleVersion(String path) throws Exception {
        final var id = createLabelled(path, "Original");

        mockMvc.perform(get(path + "/{id}", id))
                .andExpect(jsonPath("$.version").value(0))
                .andExpect(jsonPath("$.createdAt", notNullValue()))
                .andExpect(jsonPath("$.updatedAt", notNullValue()));

        // First person saves with the version they read: accepted, version goes up.
        mockMvc.perform(put(path + "/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"First\", \"version\": 0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1));

        // Second person still has version 0: refused.
        mockMvc.perform(put(path + "/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"Second\", \"version\": 0}"))
                .andExpect(status().isConflict());
        mockMvc.perform(get(path + "/{id}", id)).andExpect(jsonPath("$.label").value("First"));

        // Without a version, the check is skipped (handy when testing by hand).
        mockMvc.perform(put(path + "/{id}", id).contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"Third\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void appliesToEmployeesMissionsSkillsAndAssignments() throws Exception {
        final var customer = createLabelled("/customers", "ACME");
        final var technology = createLabelled("/technologies", "Java");
        final var employee = createEmployee("Ada", null);
        final var skill = create("/skills", "{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(technology));
        final var mission = create("/missions", """
                {"label": "M", "projectName": "P", "status": "ONGOING", "customerId": "%s"}""".formatted(customer));
        final var body = mockMvc.perform(post("/missions/{id}/assignments", mission)
                .contentType(MediaType.APPLICATION_JSON).content("{\"employeeId\": \"%s\"}".formatted(employee)))
                .andReturn().getResponse().getContentAsString();
        final String assignment = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        expectStaleUpdateRefused("/employees/" + employee, """
                {"firstName": "%s", "lastName": "Doe", "seniority": "SENIOR", "community": "OWL", "version": %d}""");
        expectStaleUpdateRefused("/skills/" + skill, """
                {"label": "%%s", "technologyId": "%s", "version": %%d}""".formatted(technology));
        expectStaleUpdateRefused("/missions/" + mission, """
                {"label": "%%s", "projectName": "P", "status": "ONGOING", "customerId": "%s", "version": %%d}"""
                .formatted(customer));
        expectStaleUpdateRefused("/missions/" + mission + "/assignments/" + assignment, """
                {"employeeId": "%s", "comment": "%%s", "version": %%d}""".formatted(employee));
    }

    @Test
    void employeeVersionReflectsRoleChanges() throws Exception {
        final var employee = createEmployee("Ada", null);
        final var role = createLabelled("/roles", "Tech Lead");

        // The response carries the version after the change, so the client can keep editing without a reload.
        final var body = mockMvc.perform(put("/employees/{id}/roles", employee)
                .contentType(MediaType.APPLICATION_JSON).content("{\"roleIds\": [\"%s\"]}".formatted(role)))
                .andReturn().getResponse().getContentAsString();
        final Integer version = com.jayway.jsonpath.JsonPath.read(body, "$.version");

        mockMvc.perform(get("/employees/{id}", employee)).andExpect(jsonPath("$.version").value(version));
    }

    /**
     * Changes the record with version 0 (accepted), then changes it again with version 0 (refused). The template
     * takes a text value to change, then the version.
     */
    private void expectStaleUpdateRefused(String path, String jsonTemplate) throws Exception {
        mockMvc.perform(put(path).contentType(MediaType.APPLICATION_JSON).content(jsonTemplate.formatted("First", 0)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1));
        mockMvc.perform(put(path).contentType(MediaType.APPLICATION_JSON).content(jsonTemplate.formatted("Second", 0)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").exists());
    }

}
