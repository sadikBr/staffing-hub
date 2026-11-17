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

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class EmployeeApiTests extends ApiTestSupport {

    @Test
    void createsAnEmployeeWithoutManager() throws Exception {
        mockMvc.perform(post("/employees").contentType(MediaType.APPLICATION_JSON).content(employeeJson("Ada", null)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.firstName").value("Ada"))
                .andExpect(jsonPath("$.manager").value(nullValue()));
    }

    @Test
    void rejectsInvalidEmployeeFields() throws Exception {
        mockMvc.perform(post("/employees").contentType(MediaType.APPLICATION_JSON)
                .content("{\"firstName\": \" \", \"lastName\": \"Doe\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.seniority").exists())
                .andExpect(jsonPath("$.errors.community").exists());
    }

    @Test
    void rejectsUnknownEnumValues() throws Exception {
        mockMvc.perform(post("/employees").contentType(MediaType.APPLICATION_JSON).content("""
                {"firstName": "Ada", "lastName": "Doe", "seniority": "GURU", "community": "OWL"}"""))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsUnknownManager() throws Exception {
        mockMvc.perform(post("/employees").contentType(MediaType.APPLICATION_JSON)
                .content(employeeJson("Ada", UUID.randomUUID().toString())))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void showsManagerAndStaffAsSummaries() throws Exception {
        final var boss = createEmployee("Boss", null);
        final var report = createEmployee("Report", boss);

        mockMvc.perform(get("/employees/{id}", boss))
                .andExpect(jsonPath("$.staff", hasSize(1)))
                .andExpect(jsonPath("$.staff[0].id").value(report));
        mockMvc.perform(get("/employees/{id}", report))
                .andExpect(jsonPath("$.manager.id").value(boss));
    }

    @Test
    void anEmployeeCannotBeTheirOwnManager() throws Exception {
        final var ada = createEmployee("Ada", null);

        mockMvc.perform(put("/employees/{id}", ada).contentType(MediaType.APPLICATION_JSON)
                .content(employeeJson("Ada", ada)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void rejectsManagementCycles() throws Exception {
        final var top = createEmployee("Top", null);
        final var middle = createEmployee("Middle", top);
        final var bottom = createEmployee("Bottom", middle);

        mockMvc.perform(put("/employees/{id}", top).contentType(MediaType.APPLICATION_JSON)
                .content(employeeJson("Top", bottom)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void updatingWithoutManagerRemovesTheManager() throws Exception {
        final var boss = createEmployee("Boss", null);
        final var report = createEmployee("Report", boss);

        mockMvc.perform(put("/employees/{id}", report).contentType(MediaType.APPLICATION_JSON)
                .content(employeeJson("Report", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manager").value(nullValue()));
    }

    @Test
    void deletingAManagerKeepsTheirStaff() throws Exception {
        final var boss = createEmployee("Boss", null);
        final var report = createEmployee("Report", boss);

        mockMvc.perform(delete("/employees/{id}", boss)).andExpect(status().isNoContent());

        mockMvc.perform(get("/employees/{id}", report))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manager").value(nullValue()));
        mockMvc.perform(get("/employees/{id}", boss)).andExpect(status().isNotFound());
    }

    @Test
    void paginatesEmployees() throws Exception {
        for (final var name : new String[] { "A", "B", "C" }) {
            createEmployee(name, null);
        }

        mockMvc.perform(get("/employees").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.page.totalElements").value(3))
                .andExpect(jsonPath("$.page.totalPages").value(2));
    }

    @Test
    void setsRolesAndReportsUnknownIds() throws Exception {
        final var ada = createEmployee("Ada", null);
        final var role = createLabelled("/roles", "Tech Lead");

        mockMvc.perform(put("/employees/{id}/roles", ada).contentType(MediaType.APPLICATION_JSON)
                .content("{\"roleIds\": [\"%s\"]}".formatted(role)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0].label").value("Tech Lead"));

        final var unknown = UUID.randomUUID();
        mockMvc.perform(put("/employees/{id}/roles", ada).contentType(MediaType.APPLICATION_JSON)
                .content("{\"roleIds\": [\"%s\", \"%s\"]}".formatted(role, unknown)))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.detail").value("No role exists with the id(s) " + unknown));
    }

    @Test
    void returnsNotFoundForUnknownEmployee() throws Exception {
        mockMvc.perform(get("/employees/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void returnsBadRequestForMalformedId() throws Exception {
        mockMvc.perform(get("/employees/not-a-uuid")).andExpect(status().isBadRequest());
    }

}
