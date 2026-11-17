package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

class OpenApiDocsTests extends ApiTestSupport {

    @Test
    void servesTheOpenApiSpec() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Staffing Hub API"))
                .andExpect(jsonPath("$.tags[*].name",
                        containsInAnyOrder("Customers", "Employees", "Missions", "Roles", "Skills", "Technologies")))
                .andExpect(jsonPath("$.paths", hasKey("/employees/{id}/skills/{skillId}")))
                // Filters and pagination appear as separate query parameters, not as "criteria"/"pageable" objects.
                .andExpect(jsonPath("$.paths['/employees'].get.parameters[*].name",
                        hasItems("search", "skillId", "minSkillLevel", "includeFormer", "page", "size", "sort")))
                .andExpect(jsonPath("$.paths['/employees/availability'].get.parameters[*].name",
                        hasItems("from", "to", "minAvailability", "search", "page")))
                .andExpect(jsonPath("$.components.schemas.EmployeeCreationUpdateRequest.required").isArray());
    }

    @Test
    void servesSwaggerUi() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }

}
