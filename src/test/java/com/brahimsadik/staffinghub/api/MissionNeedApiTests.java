package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import com.jayway.jsonpath.JsonPath;

class MissionNeedApiTests extends ApiTestSupport {

    private String mission;
    private String developer;
    private String spring;
    private String ada;
    private String grace;
    private String linus;

    @BeforeEach
    void setUp() throws Exception {
        final var customer = createLabelled("/api/customers", "ACME");
        mission = create("/api/missions", """
                {"label": "Billing", "projectName": "Billing", "status": "CONFIRMED", "customerId": "%s"}"""
                .formatted(customer));
        developer = createLabelled("/api/roles", "Developer");
        final var java = createLabelled("/api/technologies", "Java");
        spring = create("/api/skills", "{\"label\": \"Spring\", \"technologyId\": \"%s\"}".formatted(java));
        putOk("/api/missions/" + mission + "/skills/" + spring, "{\"requiredLevel\": \"ADVANCED\"}");

        // Ada: senior developer, Spring expert, but busy. Grace: senior, Spring beginner, free. Linus: junior, free.
        ada = create("/api/employees", employeeJson("Ada", "Lovelace", "SENIOR", "OWL", null));
        grace = create("/api/employees", employeeJson("Grace", "Hopper", "SENIOR", "OWL", null));
        linus = create("/api/employees", employeeJson("Linus", "Torvalds", "JUNIOR", "WOLF", null));
        for (final var employee : new String[] { ada, grace }) {
            putOk("/api/employees/" + employee + "/roles", "{\"roleIds\": [\"%s\"]}".formatted(developer));
            putOk("/api/employees/" + employee + "/technologies", "{\"technologyIds\": [\"%s\"]}".formatted(java));
        }
        putOk("/api/employees/" + ada + "/skills/" + spring, "{\"level\": \"EXPERT\"}");
        putOk("/api/employees/" + grace + "/skills/" + spring, "{\"level\": \"BEGINNER\"}");
        final var other = create("/api/missions", """
                {"label": "Other", "projectName": "Other", "status": "ONGOING", "customerId": "%s"}"""
                .formatted(customer));
        mockMvc.perform(post("/api/missions/{id}/assignments", other).contentType(MediaType.APPLICATION_JSON).content("""
                {"employeeId": "%s", "startDate": "2026-01-01", "endDate": "2026-12-31", "rate": 80}""".formatted(ada)));
    }

    @Test
    void addsNeedsAndRanksCandidates() throws Exception {
        final var need = createNeed("""
                {"roleId": "%s", "seniority": "SENIOR", "startDate": "2026-03-01", "endDate": "2026-05-31", "rate": 100}"""
                .formatted(developer));

        mockMvc.perform(get("/api/missions/{id}", mission))
                .andExpect(jsonPath("$.needs", hasSize(1)))
                .andExpect(jsonPath("$.needs[0].role.label").value("Developer"))
                .andExpect(jsonPath("$.needs[0].filledBy").value(nullValue()));

        // Grace (free, right seniority and role, Spring below level) beats Ada (expert but 20% free) and Linus.
        mockMvc.perform(get("/api/missions/{id}/needs/{needId}/candidates", mission, need))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].lastName", contains("Hopper", "Lovelace", "Torvalds")))
                .andExpect(jsonPath("$[*].score", contains(59, 20, 0)))
                .andExpect(jsonPath("$[0].availability").value(100))
                .andExpect(jsonPath("$[0].roleMatch").value(true))
                .andExpect(jsonPath("$[0].seniorityMatch").value(true))
                .andExpect(jsonPath("$[0].skillMatches[0].employeeLevel").value("BEGINNER"))
                .andExpect(jsonPath("$[1].skillMatches[0].meetsRequirement").value(true))
                .andExpect(jsonPath("$[2].roleMatch").value(false));
    }

    @Test
    void fillingANeedAssignsTheEmployeeAndRemovingTheAssignmentReopensIt() throws Exception {
        final var need = createNeed("""
                {"startDate": "2026-03-01", "endDate": "2026-05-31", "rate": 60, "comment": "Backend"}""");

        final var body = mockMvc.perform(post("/api/missions/{id}/needs/{needId}/fill", mission, need)
                .contentType(MediaType.APPLICATION_JSON).content("{\"employeeId\": \"%s\"}".formatted(grace)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.needs[0].filledBy.employee.lastName").value("Hopper"))
                .andExpect(jsonPath("$.assignments[0].startDate").value("2026-03-01"))
                .andExpect(jsonPath("$.assignments[0].rate").value(60))
                .andReturn().getResponse().getContentAsString();
        final String assignment = JsonPath.read(body, "$.needs[0].filledBy.assignmentId");

        mockMvc.perform(post("/api/missions/{id}/needs/{needId}/fill", mission, need)
                .contentType(MediaType.APPLICATION_JSON).content("{\"employeeId\": \"%s\"}".formatted(linus)))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/dashboard")).andExpect(jsonPath("$.openNeedCount").value(0));

        mockMvc.perform(delete("/api/missions/{id}/assignments/{assignmentId}", mission, assignment))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/missions/{id}", mission))
                .andExpect(jsonPath("$.needs[0].filledBy").value(nullValue()))
                .andExpect(jsonPath("$.assignments", hasSize(0)));
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(jsonPath("$.openNeedCount").value(1))
                .andExpect(jsonPath("$.openNeeds[0].mission.label").value("Billing"))
                .andExpect(jsonPath("$.openNeeds[0].need.comment").value("Backend"));
    }

    @Test
    void updatesAndDeletesNeeds() throws Exception {
        final var need = createNeed("{\"seniority\": \"JUNIOR\"}");

        mockMvc.perform(put("/api/missions/{id}/needs/{needId}", mission, need).contentType(MediaType.APPLICATION_JSON)
                .content("{\"seniority\": \"SENIOR\", \"rate\": 50, \"version\": 0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.needs[0].seniority").value("SENIOR"))
                .andExpect(jsonPath("$.needs[0].rate").value(50));
        mockMvc.perform(put("/api/missions/{id}/needs/{needId}", mission, need).contentType(MediaType.APPLICATION_JSON)
                .content("{\"seniority\": \"SENIOR\", \"version\": 0}"))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/missions/{id}/needs", mission).contentType(MediaType.APPLICATION_JSON)
                .content("{\"startDate\": \"2026-03-01\", \"endDate\": \"2026-02-01\"}"))
                .andExpect(status().isUnprocessableContent());

        mockMvc.perform(delete("/api/missions/{id}/needs/{needId}", mission, need)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/missions/{id}", mission)).andExpect(jsonPath("$.needs", hasSize(0)));
    }

    @Test
    void movesAnAssignmentWithoutTouchingTheRest() throws Exception {
        final var body = mockMvc.perform(post("/api/missions/{id}/assignments", mission)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"employeeId": "%s", "startDate": "2026-01-01", "endDate": "2026-01-31", "duration": 20,
                         "rate": 50, "appreciation": "Great"}""".formatted(linus)))
                .andReturn().getResponse().getContentAsString();
        final String assignment = JsonPath.read(body, "$.id");

        mockMvc.perform(patch("/api/missions/{id}/assignments/{assignmentId}/period", mission, assignment)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startDate\": \"2026-02-01\", \"endDate\": \"2026-02-10\", \"version\": 0}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startDate").value("2026-02-01"))
                .andExpect(jsonPath("$.endDate").value("2026-02-10"))
                .andExpect(jsonPath("$.duration").value(10))
                .andExpect(jsonPath("$.rate").value(50))
                .andExpect(jsonPath("$.appreciation").value("Great"));

        mockMvc.perform(patch("/api/missions/{id}/assignments/{assignmentId}/period", mission, assignment)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startDate\": \"2026-03-01\", \"version\": 0}"))
                .andExpect(status().isConflict());
        mockMvc.perform(patch("/api/missions/{id}/assignments/{assignmentId}/period", mission, assignment)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startDate\": \"2026-03-01\", \"endDate\": \"2026-02-01\"}"))
                .andExpect(status().isUnprocessableContent());
        // The availability view carries the version needed to move assignments.
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-02-01").param("to", "2026-02-28")
                .param("search", "torvalds"))
                .andExpect(jsonPath("$.content[0].assignments[0].version").value(1));
    }

    private String createNeed(String json) throws Exception {
        final var body = mockMvc.perform(post("/api/missions/{id}/needs", mission)
                .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.needs[-1].id");
    }

    private ResultActions putOk(String path, String json) throws Exception {
        return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(path)
                .contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isOk());
    }

}
