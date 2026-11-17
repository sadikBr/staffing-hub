package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class EmployeeSearchApiTests extends ApiTestSupport {

    private String ada;
    private String grace;
    private String linus;
    private String java;
    private String streams;

    @BeforeEach
    void setUp() throws Exception {
        ada = create("/employees", employeeJson("Ada", "Lovelace", "SENIOR", "OWL", null));
        grace = create("/employees", employeeJson("Grace", "Hopper", "MID_LEVEL", "OWL", null));
        linus = create("/employees", employeeJson("Linus", "Torvalds", "JUNIOR", "WOLF", null));

        java = createLabelled("/technologies", "Java");
        streams = create("/skills", "{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(java));
        for (final var employee : new String[] { ada, grace }) {
            mockMvc.perform(put("/employees/{id}/technologies", employee).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"technologyIds\": [\"%s\"]}".formatted(java)));
        }
        setSkill(ada, "EXPERT");
        setSkill(grace, "BEGINNER");
    }

    @Test
    void searchesByNameInAnyOrderAndCase() throws Exception {
        expectNames(get("/employees").param("search", "LOVE"), "Lovelace");
        expectNames(get("/employees").param("search", "ada love"), "Lovelace");
        expectNames(get("/employees").param("search", "hopper grace"), "Hopper");
        expectNames(get("/employees").param("search", "%"));
    }

    @Test
    void filtersBySeniorityAndCommunity() throws Exception {
        expectNames(get("/employees").param("community", "OWL"), "Hopper", "Lovelace");
        expectNames(get("/employees").param("community", "OWL").param("seniority", "SENIOR"), "Lovelace");
    }

    @Test
    void filtersByTechnologyAndRole() throws Exception {
        final var lead = createLabelled("/roles", "Tech Lead");
        mockMvc.perform(put("/employees/{id}/roles", linus).contentType(MediaType.APPLICATION_JSON)
                .content("{\"roleIds\": [\"%s\"]}".formatted(lead)));

        expectNames(get("/employees").param("technologyId", java), "Hopper", "Lovelace");
        expectNames(get("/employees").param("roleId", lead), "Torvalds");
    }

    @Test
    void filtersBySkillAndMinimumLevel() throws Exception {
        expectNames(get("/employees").param("skillId", streams), "Hopper", "Lovelace");
        expectNames(get("/employees").param("skillId", streams).param("minSkillLevel", "ADVANCED"), "Lovelace");
        expectNames(get("/employees").param("skillId", streams).param("minSkillLevel", "BEGINNER"),
                "Hopper", "Lovelace");

        mockMvc.perform(get("/employees").param("minSkillLevel", "ADVANCED"))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void filtersByManager() throws Exception {
        mockMvc.perform(put("/employees/{id}", grace).contentType(MediaType.APPLICATION_JSON).content("""
                {"firstName": "Grace", "lastName": "Hopper", "seniority": "MID_LEVEL", "community": "OWL",
                 "managerId": "%s"}""".formatted(ada)));

        expectNames(get("/employees").param("managerId", ada), "Hopper");
    }

    @Test
    void hidesFormerEmployeesUnlessAsked() throws Exception {
        final var yesterday = LocalDate.now().minusDays(1).toString();
        final var nextMonth = LocalDate.now().plusMonths(1).toString();
        create("/employees", employeeJson("Old", "Former", "SENIOR", "OWL", yesterday));
        create("/employees", employeeJson("Soon", "Leaving", "SENIOR", "OWL", nextMonth));

        expectNames(get("/employees").param("community", "OWL"), "Hopper", "Leaving", "Lovelace");
        expectNames(get("/employees").param("community", "OWL").param("includeFormer", "true"),
                "Former", "Hopper", "Leaving", "Lovelace");
    }

    private void expectNames(org.springframework.test.web.servlet.RequestBuilder request, String... lastNames)
            throws Exception {
        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(lastNames.length == 0
                        ? jsonPath("$.content", empty())
                        : jsonPath("$.content[*].lastName", contains(lastNames)));
    }

    private void setSkill(String employee, String level) throws Exception {
        mockMvc.perform(put("/employees/{id}/skills/{skillId}", employee, streams)
                .contentType(MediaType.APPLICATION_JSON).content("{\"level\": \"%s\"}".formatted(level)))
                .andExpect(status().isOk());
    }

}
