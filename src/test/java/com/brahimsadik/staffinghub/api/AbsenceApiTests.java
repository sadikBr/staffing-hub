package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class AbsenceApiTests extends ApiTestSupport {

    private String linus;

    @BeforeEach
    void setUp() throws Exception {
        linus = create("/api/employees", employeeJson("Linus", "Torvalds", "JUNIOR", "WOLF", null));
    }

    @Test
    void recordsUpdatesAndDeletesAbsences() throws Exception {
        // Monday 12 to Friday 16 January 2026: 5 working days.
        final var holiday = create("/api/employees/" + linus + "/absences", absenceJson("HOLIDAY", "2026-01-12", "2026-01-16"));
        create("/api/employees/" + linus + "/absences", absenceJson("TRAINING", "2026-03-02", "2026-03-03"));

        mockMvc.perform(get("/api/employees/{id}/absences", linus))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].type", contains("TRAINING", "HOLIDAY")))
                .andExpect(jsonPath("$[1].workingDays").value(5));

        mockMvc.perform(put("/api/employees/{id}/absences/{absenceId}", linus, holiday)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"type": "SICK_LEAVE", "startDate": "2026-01-12", "endDate": "2026-01-18", "comment": "Flu", "version": 0}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("SICK_LEAVE"))
                .andExpect(jsonPath("$.workingDays").value(5))
                .andExpect(jsonPath("$.comment").value("Flu"));

        mockMvc.perform(delete("/api/employees/{id}/absences/{absenceId}", linus, holiday))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/employees/{id}/absences", linus)).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void refusesInvalidAndOverlappingAbsences() throws Exception {
        create("/api/employees/" + linus + "/absences", absenceJson("HOLIDAY", "2026-01-12", "2026-01-16"));

        postAbsence(absenceJson("HOLIDAY", "2026-01-16", "2026-01-20"))
                .andExpect(status().isUnprocessableContent());
        postAbsence(absenceJson("HOLIDAY", "2026-02-10", "2026-02-01"))
                .andExpect(status().isUnprocessableContent());
        postAbsence("{\"type\": \"HOLIDAY\"}").andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/employees/{id}/absences", "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void absencesReduceAvailabilityOverBoundedPeriods() throws Exception {
        create("/api/employees/" + linus + "/absences", absenceJson("HOLIDAY", "2026-01-12", "2026-01-16"));

        // January 2026 has 22 working days; away 5 of them: 100% x 17/22.
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01").param("to", "2026-01-31"))
                .andExpect(jsonPath("$.content[0].availability").value(77.3))
                .andExpect(jsonPath("$.content[0].absentDays").value(5))
                .andExpect(jsonPath("$.content[0].absences[0].type").value("HOLIDAY"));

        // Open-ended periods report the days away but do not spread them.
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-01-01"))
                .andExpect(jsonPath("$.content[0].availability").value(100))
                .andExpect(jsonPath("$.content[0].absentDays").value(5));

        // Outside the absence: fully available.
        mockMvc.perform(get("/api/employees/availability").param("from", "2026-02-01").param("to", "2026-02-28"))
                .andExpect(jsonPath("$.content[0].availability").value(100))
                .andExpect(jsonPath("$.content[0].absences", hasSize(0)));
    }

    private org.springframework.test.web.servlet.ResultActions postAbsence(String json) throws Exception {
        return mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .post("/api/employees/{id}/absences", linus).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static String absenceJson(String type, String start, String end) {
        return """
                {"type": "%s", "startDate": "%s", "endDate": "%s"}""".formatted(type, start, end);
    }

}
