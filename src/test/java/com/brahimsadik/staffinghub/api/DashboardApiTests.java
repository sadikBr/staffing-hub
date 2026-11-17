package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class DashboardApiTests extends ApiTestSupport {

    @Test
    void summarisesTheNext30Days() throws Exception {
        final var today = LocalDate.now();
        final var customer = createLabelled("/api/customers", "ACME");
        final var ongoing = create("/api/missions", missionJson("Ongoing", "ONGOING", customer));
        create("/api/missions", missionJson("Prospect", "PROSPECT", customer));

        final var free = create("/api/employees", employeeJson("Free", "Person", "SENIOR", "OWL", null));
        final var busy = create("/api/employees", employeeJson("Busy", "Person", "SENIOR", "OWL", null));
        create("/api/employees", employeeJson("Gone", "Person", "SENIOR", "OWL", today.minusDays(1).toString()));

        assign(ongoing, busy, today, today.plusDays(10), 70);
        assign(ongoing, busy, today, today.plusDays(60), 50); // overbooked: 120% during the first 10 days
        assign(ongoing, free, today.minusDays(30), today.plusDays(100), 20);

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horizonDays").value(30))
                .andExpect(jsonPath("$.activeEmployees").value(2))
                .andExpect(jsonPath("$.availableEmployees").value(1))
                .andExpect(jsonPath("$.overbookedEmployees").value(1))
                .andExpect(jsonPath("$.mostAvailable[0].id").value(free))
                .andExpect(jsonPath("$.overbooked[0].id").value(busy))
                .andExpect(jsonPath("$.missionsByStatus.ONGOING").value(1))
                .andExpect(jsonPath("$.missionsByStatus.PROSPECT").value(1))
                .andExpect(jsonPath("$.missionsByStatus.CANCELLED").value(0))
                .andExpect(jsonPath("$.assignmentsEndingSoon", hasSize(1)))
                .andExpect(jsonPath("$.assignmentsEndingSoon[0].employee.id").value(busy))
                .andExpect(jsonPath("$.assignmentsEndingSoon[0].mission.label").value("Ongoing"));
    }

    private static String missionJson(String label, String status, String customer) {
        return """
                {"label": "%s", "projectName": "P", "status": "%s", "customerId": "%s"}"""
                .formatted(label, status, customer);
    }

    private void assign(String mission, String employee, LocalDate start, LocalDate end, int rate) throws Exception {
        mockMvc.perform(post("/api/missions/{id}/assignments", mission).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"employeeId": "%s", "startDate": "%s", "endDate": "%s", "rate": %d}"""
                        .formatted(employee, start, end, rate)))
                .andExpect(status().isCreated());
    }

}
