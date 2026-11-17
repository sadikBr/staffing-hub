package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

class MissionApiTests extends ApiTestSupport {

    private String customer;
    private String employee;
    private String java;
    private String streams;

    @BeforeEach
    void setUp() throws Exception {
        customer = createLabelled("/api/customers", "ACME");
        employee = createEmployee("Ada", null);
        java = createLabelled("/api/technologies", "Java");
        streams = create("/api/skills", "{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(java));
    }

    // --- Missions ---------------------------------------------------------------------------------------------

    @Test
    void createsAndUpdatesAMission() throws Exception {
        final var mission = createMission("Billing revamp", "ONGOING", "DATA", employee);

        mockMvc.perform(get("/api/missions/{id}", mission))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Billing revamp"))
                .andExpect(jsonPath("$.customer.label").value("ACME"))
                .andExpect(jsonPath("$.projectManager.id").value(employee))
                .andExpect(jsonPath("$.businessUnit").value("DATA"))
                .andExpect(jsonPath("$.requiredSkills", hasSize(0)))
                .andExpect(jsonPath("$.assignments", hasSize(0)));

        mockMvc.perform(put("/api/missions/{id}", mission).contentType(MediaType.APPLICATION_JSON)
                .content(missionJson("Billing revamp v2", "COMPLETED", null, null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Billing revamp v2"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.businessUnit").value(nullValue()))
                .andExpect(jsonPath("$.projectManager").value(nullValue()));
    }

    @Test
    void validatesMissions() throws Exception {
        mockMvc.perform(post("/api/missions").contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"\", \"starUrl\": \"not a url\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.label").exists())
                .andExpect(jsonPath("$.errors.projectName").exists())
                .andExpect(jsonPath("$.errors.status").exists())
                .andExpect(jsonPath("$.errors.customerId").exists())
                .andExpect(jsonPath("$.errors.starUrl").exists());
    }

    @Test
    void rejectsUnknownCustomerOrProjectManager() throws Exception {
        mockMvc.perform(post("/api/missions").contentType(MediaType.APPLICATION_JSON).content(
                missionJson("M", "ONGOING", null, null).replace(customer, UUID.randomUUID().toString())))
                .andExpect(status().isUnprocessableContent());
        mockMvc.perform(post("/api/missions").contentType(MediaType.APPLICATION_JSON)
                .content(missionJson("M", "ONGOING", null, UUID.randomUUID().toString())))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void filtersAndPaginatesMissions() throws Exception {
        final var otherCustomer = createLabelled("/api/customers", "Globex");
        createMission("A", "ONGOING", "DATA", null);
        createMission("B", "ONGOING", "CLOUD", null);
        createMission("C", "COMPLETED", "DATA", null);
        create("/api/missions", missionJson("D", "ONGOING", "DATA", null).replace(customer, otherCustomer));

        mockMvc.perform(get("/api/missions")).andExpect(jsonPath("$.page.totalElements").value(4));
        mockMvc.perform(get("/api/missions").param("status", "ONGOING"))
                .andExpect(jsonPath("$.page.totalElements").value(3));
        mockMvc.perform(get("/api/missions").param("status", "ONGOING").param("businessUnit", "DATA"))
                .andExpect(jsonPath("$.content[*].label").value(org.hamcrest.Matchers.contains("A", "D")));
        mockMvc.perform(get("/api/missions").param("customerId", otherCustomer))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].label").value("D"));
        mockMvc.perform(get("/api/missions").param("search", "project b"))
                .andExpect(jsonPath("$.content[*].label").value(org.hamcrest.Matchers.contains("B")));
        mockMvc.perform(get("/api/missions").param("search", "GLOBEX"))
                .andExpect(jsonPath("$.content[*].label").value(org.hamcrest.Matchers.contains("D")));
        mockMvc.perform(get("/api/missions").param("size", "2"))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.page.totalPages").value(2));
    }

    @Test
    void deletingAMissionDeletesItsAssignments() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        assign(mission, assignmentJson(employee, null, null, null, null)).andExpect(status().isCreated());

        mockMvc.perform(delete("/api/missions/{id}", mission)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/missions/{id}", mission)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/employees/{id}/assignments", employee)).andExpect(jsonPath("$", hasSize(0)));
    }

    // --- Required skills --------------------------------------------------------------------------------------

    @Test
    void requiredLevelIsOptional() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);

        mockMvc.perform(put("/api/missions/{id}/skills/{skillId}", mission, streams))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiredSkills", hasSize(1)))
                .andExpect(jsonPath("$.requiredSkills[0].skill.label").value("Streams"))
                .andExpect(jsonPath("$.requiredSkills[0].requiredLevel").value(nullValue()));

        mockMvc.perform(put("/api/missions/{id}/skills/{skillId}", mission, streams)
                .contentType(MediaType.APPLICATION_JSON).content("{\"requiredLevel\": \"ADVANCED\"}"))
                .andExpect(jsonPath("$.requiredSkills", hasSize(1)))
                .andExpect(jsonPath("$.requiredSkills[0].requiredLevel").value("ADVANCED"));

        mockMvc.perform(delete("/api/missions/{id}/skills/{skillId}", mission, streams))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/missions/{id}", mission)).andExpect(jsonPath("$.requiredSkills", hasSize(0)));
        mockMvc.perform(delete("/api/missions/{id}/skills/{skillId}", mission, streams))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletingASkillRemovesItFromMissions() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        mockMvc.perform(put("/api/missions/{id}/skills/{skillId}", mission, streams)).andExpect(status().isOk());

        mockMvc.perform(delete("/api/skills/{id}", streams)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/missions/{id}", mission)).andExpect(jsonPath("$.requiredSkills", hasSize(0)));
    }

    // --- Assignments ------------------------------------------------------------------------------------------

    @Test
    void assignsEmployeesEvenBelowTheRequiredLevelAndReportsTheGap() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        final var lambdas = create("/api/skills", "{\"label\": \"Lambdas\", \"technologyId\": \"%s\"}".formatted(java));
        final var generics = create("/api/skills", "{\"label\": \"Generics\", \"technologyId\": \"%s\"}".formatted(java));
        requireSkill(mission, streams, "EXPERT");
        requireSkill(mission, lambdas, null);
        requireSkill(mission, generics, "BEGINNER");

        // Ada: Streams INTERMEDIATE (below EXPERT), Lambdas NOVICE (any level is fine), no Generics.
        mockMvc.perform(put("/api/employees/{id}/technologies", employee).contentType(MediaType.APPLICATION_JSON)
                .content("{\"technologyIds\": [\"%s\"]}".formatted(java)));
        setEmployeeSkill(streams, "INTERMEDIATE");
        setEmployeeSkill(lambdas, "NOVICE");

        final var assignment = assign(mission, assignmentJson(employee, "2026-01-01", "2026-03-01", 15, "50"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.employee.id").value(employee))
                .andExpect(jsonPath("$.duration").value(15))
                .andExpect(jsonPath("$.rate").value(50))
                // Sorted by skill label: Generics, Lambdas, Streams.
                .andExpect(jsonPath("$.skillMatches[0].skill.label").value("Generics"))
                .andExpect(jsonPath("$.skillMatches[0].employeeLevel").value(nullValue()))
                .andExpect(jsonPath("$.skillMatches[0].meetsRequirement").value(false))
                .andExpect(jsonPath("$.skillMatches[1].skill.label").value("Lambdas"))
                .andExpect(jsonPath("$.skillMatches[1].requiredLevel").value(nullValue()))
                .andExpect(jsonPath("$.skillMatches[1].meetsRequirement").value(true))
                .andExpect(jsonPath("$.skillMatches[2].skill.label").value("Streams"))
                .andExpect(jsonPath("$.skillMatches[2].requiredLevel").value("EXPERT"))
                .andExpect(jsonPath("$.skillMatches[2].employeeLevel").value("INTERMEDIATE"))
                .andExpect(jsonPath("$.skillMatches[2].meetsRequirement").value(false))
                .andReturn().getResponse().getContentAsString();

        final String assignmentId = com.jayway.jsonpath.JsonPath.read(assignment, "$.id");
        mockMvc.perform(get("/api/missions/{id}/assignments/{assignmentId}", mission, assignmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(assignmentId));
        mockMvc.perform(get("/api/missions/{id}", mission)).andExpect(jsonPath("$.assignments", hasSize(1)));
    }

    @Test
    void durationIsIndependentOfThePeriodButCannotExceedIt() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);

        // 2026-01-01 to 2026-01-10 is 10 days (both ends included).
        assign(mission, assignmentJson(employee, "2026-01-01", "2026-01-10", 10, null))
                .andExpect(status().isCreated());
        assign(mission, assignmentJson(employee, "2026-01-01", "2026-01-10", 11, null))
                .andExpect(status().isUnprocessableContent());
        assign(mission, assignmentJson(employee, "2026-01-10", "2026-01-01", null, null))
                .andExpect(status().isUnprocessableContent());
        assign(mission, assignmentJson(employee, null, null, 0, null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.duration").exists());
    }

    @Test
    void rateMustBeAPercentage() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);

        assign(mission, assignmentJson(employee, null, null, null, "100")).andExpect(status().isCreated());
        assign(mission, assignmentJson(employee, null, null, null, "62.5")).andExpect(status().isCreated());
        assign(mission, assignmentJson(employee, null, null, null, "0")).andExpect(status().isBadRequest());
        assign(mission, assignmentJson(employee, null, null, null, "100.01")).andExpect(status().isBadRequest());
        assign(mission, assignmentJson(employee, null, null, null, "50.123")).andExpect(status().isBadRequest());
    }

    @Test
    void updatesAndDeletesAssignments() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        final var other = createEmployee("Grace", null);
        final var body = assign(mission, assignmentJson(employee, null, null, null, "50"))
                .andReturn().getResponse().getContentAsString();
        final String assignmentId = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(put("/api/missions/{id}/assignments/{assignmentId}", mission, assignmentId)
                .contentType(MediaType.APPLICATION_JSON).content(assignmentJson(other, null, null, 5, "80")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employee.id").value(other))
                .andExpect(jsonPath("$.rate").value(80));

        mockMvc.perform(delete("/api/missions/{id}/assignments/{assignmentId}", mission, assignmentId))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/missions/{id}/assignments/{assignmentId}", mission, assignmentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void anAssignmentIsOnlyReachableThroughItsOwnMission() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        final var otherMission = createMission("Other", "ONGOING", null, null);
        final var body = assign(mission, assignmentJson(employee, null, null, null, null))
                .andReturn().getResponse().getContentAsString();
        final String assignmentId = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(get("/api/missions/{id}/assignments/{assignmentId}", otherMission, assignmentId))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsUnknownEmployeeInAssignment() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        assign(mission, assignmentJson(UUID.randomUUID().toString(), null, null, null, null))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void listsAnEmployeesAssignmentsMostRecentFirst() throws Exception {
        final var older = createMission("Older", "COMPLETED", null, null);
        final var newer = createMission("Newer", "ONGOING", null, null);
        final var undated = createMission("Undated", "PROSPECT", null, null);
        assign(older, assignmentJson(employee, "2025-01-01", "2025-06-30", null, null));
        assign(undated, assignmentJson(employee, null, null, null, null));
        assign(newer, assignmentJson(employee, "2026-01-01", null, null, null));

        mockMvc.perform(get("/api/employees/{id}/assignments", employee))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].mission.label")
                        .value(org.hamcrest.Matchers.contains("Newer", "Older", "Undated")))
                .andExpect(jsonPath("$[0].mission.customer.label").value("ACME"));
        mockMvc.perform(get("/api/employees/{id}/assignments", UUID.randomUUID())).andExpect(status().isNotFound());
    }

    // --- Effects on other resources ---------------------------------------------------------------------------

    @Test
    void anEmployeeWithAssignmentsCannotBeDeleted() throws Exception {
        final var mission = createMission("M", "ONGOING", null, null);
        assign(mission, assignmentJson(employee, null, null, null, null));

        mockMvc.perform(delete("/api/employees/{id}", employee)).andExpect(status().isConflict());
    }

    @Test
    void deletingTheProjectManagerLeavesTheMissionWithoutOne() throws Exception {
        final var mission = createMission("M", "ONGOING", null, employee);

        mockMvc.perform(delete("/api/employees/{id}", employee)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/missions/{id}", mission))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectManager").value(nullValue()));
    }

    @Test
    void aCustomerWithMissionsCannotBeDeleted() throws Exception {
        createMission("M", "ONGOING", null, null);

        mockMvc.perform(delete("/api/customers/{id}", customer)).andExpect(status().isConflict());
    }

    // --- Helpers ----------------------------------------------------------------------------------------------

    private String createMission(String label, String status, String businessUnit, String projectManagerId)
            throws Exception {
        return create("/api/missions", missionJson(label, status, businessUnit, projectManagerId));
    }

    private String missionJson(String label, String status, String businessUnit, String projectManagerId) {
        return """
                {"label": "%s", "projectName": "Project %s", "status": "%s", "customerId": "%s",
                 "starUrl": "https://jira.example.com/browse/M-1", "businessUnit": %s, "projectManagerId": %s}"""
                .formatted(label, label, status, customer, quoted(businessUnit), quoted(projectManagerId));
    }

    private static String assignmentJson(String employeeId, String startDate, String endDate, Integer duration,
            String rate) {
        return """
                {"employeeId": "%s", "startDate": %s, "endDate": %s, "duration": %s, "rate": %s}"""
                .formatted(employeeId, quoted(startDate), quoted(endDate), duration, rate);
    }

    private ResultActions assign(String mission, String json) throws Exception {
        return mockMvc.perform(post("/api/missions/{id}/assignments", mission)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private void requireSkill(String mission, String skill, String level) throws Exception {
        mockMvc.perform(put("/api/missions/{id}/skills/{skillId}", mission, skill)
                .contentType(MediaType.APPLICATION_JSON).content("{\"requiredLevel\": %s}".formatted(quoted(level))))
                .andExpect(status().isOk());
    }

    private void setEmployeeSkill(String skill, String level) throws Exception {
        mockMvc.perform(put("/api/employees/{id}/skills/{skillId}", employee, skill)
                .contentType(MediaType.APPLICATION_JSON).content("{\"level\": \"%s\"}".formatted(level)))
                .andExpect(status().isOk());
    }

}
