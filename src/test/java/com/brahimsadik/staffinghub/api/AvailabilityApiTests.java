package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

class AvailabilityApiTests extends ApiTestSupport {

    private String mission;
    private String ada;
    private String grace;
    private String linus;

    @BeforeEach
    void setUp() throws Exception {
        final var customer = createLabelled("/api/customers", "ACME");
        mission = create("/api/missions", """
                {"label": "Billing", "projectName": "Billing", "status": "ONGOING", "customerId": "%s"}"""
                .formatted(customer));
        ada = create("/api/employees", employeeJson("Ada", "Lovelace", "SENIOR", "OWL", null));
        grace = create("/api/employees", employeeJson("Grace", "Hopper", "SENIOR", "OWL", null));
        linus = create("/api/employees", employeeJson("Linus", "Torvalds", "JUNIOR", "WOLF", null));

        // In January 2026: Ada is 80% busy at peak, Grace 50%, Linus free.
        assign(ada, "2026-01-01", "2026-01-20", "50");
        assign(ada, "2026-01-15", "2026-02-15", "30");
        assign(grace, "2026-01-10", null, "50");
    }

    @Test
    void listsEveryoneMostAvailableFirst() throws Exception {
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].lastName", contains("Torvalds", "Hopper", "Lovelace")))
                .andExpect(jsonPath("$.content[2].peakOccupation").value(80))
                .andExpect(jsonPath("$.content[2].availability").value(20))
                .andExpect(jsonPath("$.content[2].assignments", hasSize(2)))
                .andExpect(jsonPath("$.content[2].assignments[0].mission.label").value("Billing"))
                .andExpect(jsonPath("$.content[0].availability").value(100))
                .andExpect(jsonPath("$.page.totalElements").value(3));
    }

    @Test
    void filtersByMinimumAvailabilityAndOtherCriteria() throws Exception {
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31")
                .param("minAvailability", "50"))
                .andExpect(jsonPath("$.content[*].lastName", contains("Torvalds", "Hopper")));

        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31")
                .param("minAvailability", "50").param("seniority", "SENIOR"))
                .andExpect(jsonPath("$.content[*].lastName", contains("Hopper")));
    }

    @Test
    void ongoingAssignmentsCountInOpenEndedPeriods() throws Exception {
        mockMvc.perform(get("/api/employees/availability").param("from", "2027-01-01").param("search", "hopper"))
                .andExpect(jsonPath("$.content[0].peakOccupation").value(50));
        mockMvc.perform(get("/api/employees/availability").param("from", "2027-01-01").param("search", "lovelace"))
                .andExpect(jsonPath("$.content[0].peakOccupation").value(0));
    }

    @Test
    void reportsOverbooking() throws Exception {
        assign(linus, "2026-01-01", "2026-01-31", "80")
                .andExpect(jsonPath("$.employeeOccupation.peakRate").value(80))
                .andExpect(jsonPath("$.employeeOccupation.overbooked").value(false));

        // Allowed, but flagged.
        assign(linus, "2026-01-15", "2026-01-31", "40")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeOccupation.peakRate").value(120))
                .andExpect(jsonPath("$.employeeOccupation.overbooked").value(true));

        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31")
                .param("search", "torvalds"))
                .andExpect(jsonPath("$.content[0].overbooked").value(true))
                .andExpect(jsonPath("$.content[0].availability").value(0));
        mockMvc.perform(get("/api/employees/{id}/assignments", linus))
                .andExpect(jsonPath("$[0].employeeOccupation.overbooked").value(true));
    }

    @Test
    void employeesLeavingDuringThePeriodAreNotAvailable() throws Exception {
        final var leaving = create("/api/employees",
                employeeJson("Soon", "Leaving", "SENIOR", "OWL", "2026-01-20"));
        create("/api/employees", employeeJson("Long", "Gone", "SENIOR", "OWL", "2025-06-30"));

        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31")
                .param("community", "OWL"))
                // Most available first: Hopper 50%, Lovelace 20%, Leaving 0% (leaves on the 20th). Gone is excluded.
                .andExpect(jsonPath("$.content[*].lastName", contains("Hopper", "Lovelace", "Leaving")))
                .andExpect(jsonPath("$.content[?(@.id == '%s')].availability".formatted(leaving)).value(0));
    }

    @Test
    void filtersByCustomerMissionAndSituation() throws Exception {
        final var otherCustomer = createLabelled("/api/customers", "Globex");
        final var otherMission = create("/api/missions", """
                {"label": "Portal", "projectName": "Portal", "status": "ONGOING", "customerId": "%s"}"""
                .formatted(otherCustomer));
        mockMvc.perform(post("/api/missions/{id}/assignments", otherMission).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"employeeId": "%s", "startDate": "2026-01-05", "endDate": "2026-01-09", "rate": 100}"""
                        .formatted(linus)))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/employees/{id}/absences", grace).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"type": "HOLIDAY", "startDate": "2026-01-26", "endDate": "2026-01-27"}"""))
                .andExpect(status().isCreated());

        expectNames(january().param("missionId", mission), "Hopper", "Lovelace");
        expectNames(january().param("customerId", otherCustomer), "Torvalds");
        expectNames(january().param("situation", "AWAY"), "Hopper");
        expectNames(january().param("situation", "OVERBOOKED"));
        // In February, Linus has no mission: he is on the bench.
        expectNames(get("/api/employees/availability").param("from", "2026-02-01").param("to", "2026-02-28")
                .param("situation", "ON_BENCH"), "Torvalds");
    }

    @Test
    void ordersResults() throws Exception {
        expectNames(january().param("order", "LEAST_AVAILABLE"), "Lovelace", "Hopper", "Torvalds");
        expectNames(january().param("order", "NAME"), "Hopper", "Lovelace", "Torvalds");
        expectNames(january(), "Torvalds", "Hopper", "Lovelace");
    }

    private MockHttpServletRequestBuilder january() {
        return get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31");
    }

    private void expectNames(MockHttpServletRequestBuilder request, String... lastNames) throws Exception {
        mockMvc.perform(request).andExpect(status().isOk())
                .andExpect(lastNames.length == 0
                        ? jsonPath("$.content", empty())
                        : jsonPath("$.content[*].lastName", contains(lastNames)));
    }

    @Test
    void validatesThePeriod() throws Exception {
        mockMvc.perform(get("/api/employees/availability")).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.from").exists());
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-02-01").param("to", "2026-01-01"))
                .andExpect(status().isUnprocessableContent());
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("minAvailability", "150"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void movingAnAssignmentToAnotherEmployeeUpdatesBothOccupations() throws Exception {
        final var body = assign(linus, "2026-01-01", "2026-01-31", "100").andReturn().getResponse()
                .getContentAsString();
        final String assignment = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .put("/api/missions/{id}/assignments/{assignmentId}", mission, assignment)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"employeeId": "%s", "startDate": "2026-01-01", "endDate": "2026-01-31", "rate": 100}"""
                        .formatted(grace)))
                .andExpect(jsonPath("$.employeeOccupation.peakRate").value(150));

        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31")
                .param("search", "torvalds"))
                .andExpect(jsonPath("$.content[0].peakOccupation").value(0));
    }

    private ResultActions assign(String employee, String start, String end, String rate) throws Exception {
        return mockMvc.perform(post("/api/missions/{id}/assignments", mission).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"employeeId": "%s", "startDate": %s, "endDate": %s, "rate": %s}"""
                        .formatted(employee, quoted(start), quoted(end), rate)));
    }

}
