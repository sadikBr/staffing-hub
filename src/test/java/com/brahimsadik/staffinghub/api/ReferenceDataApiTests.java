package com.brahimsadik.staffinghub.api;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/** Customers, roles and technologies share the same CRUD behaviour. */
class ReferenceDataApiTests extends ApiTestSupport {

    @ParameterizedTest
    @ValueSource(strings = { "/customers", "/roles", "/technologies" })
    void supportsCrud(String path) throws Exception {
        final var id = createLabelled(path, "First");

        mockMvc.perform(get(path + "/{id}", id)).andExpect(jsonPath("$.label").value("First"));
        mockMvc.perform(put(path + "/{id}", id).contentType(MediaType.APPLICATION_JSON).content("{\"label\": \"Renamed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Renamed"));
        mockMvc.perform(get(path)).andExpect(jsonPath("$", hasSize(1)));
        mockMvc.perform(delete(path + "/{id}", id)).andExpect(status().isNoContent());
        mockMvc.perform(get(path + "/{id}", id)).andExpect(status().isNotFound());
    }

    @ParameterizedTest
    @ValueSource(strings = { "/customers", "/roles", "/technologies" })
    void rejectsDuplicateLabelsOnCreateAndUpdate(String path) throws Exception {
        createLabelled(path, "Taken");
        final var other = createLabelled(path, "Other");

        mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content("{\"label\": \"Taken\"}"))
                .andExpect(status().isConflict());
        mockMvc.perform(put(path + "/{id}", other).contentType(MediaType.APPLICATION_JSON).content("{\"label\": \"Taken\"}"))
                .andExpect(status().isConflict());
    }

    @ParameterizedTest
    @ValueSource(strings = { "/customers", "/roles", "/technologies" })
    void rejectsBlankLabels(String path) throws Exception {
        mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content("{\"label\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.label").exists());
    }

    @ParameterizedTest
    @ValueSource(strings = { "/customers", "/roles", "/technologies", "/skills" })
    void returnsNotFoundForUnknownIds(String path) throws Exception {
        mockMvc.perform(get(path + "/{id}", UUID.randomUUID())).andExpect(status().isNotFound());
        mockMvc.perform(delete(path + "/{id}", UUID.randomUUID())).andExpect(status().isNotFound());
    }

    @Test
    void skillLabelsAreUniquePerTechnology() throws Exception {
        final var java = createLabelled("/technologies", "Java");
        final var python = createLabelled("/technologies", "Python");

        create("/skills", "{\"label\": \"Testing\", \"technologyId\": \"%s\"}".formatted(java));
        create("/skills", "{\"label\": \"Testing\", \"technologyId\": \"%s\"}".formatted(python));

        mockMvc.perform(post("/skills").contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"Testing\", \"technologyId\": \"%s\"}".formatted(java)))
                .andExpect(status().isConflict());
        mockMvc.perform(get("/technologies/{id}", java))
                .andExpect(jsonPath("$.skills", hasSize(1)))
                .andExpect(jsonPath("$.skills[0].technologyId").value(java));
    }

    @Test
    void filtersSkillsByTechnology() throws Exception {
        final var java = createLabelled("/technologies", "Java");
        final var python = createLabelled("/technologies", "Python");
        create("/skills", "{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(java));
        create("/skills", "{\"label\": \"Asyncio\", \"technologyId\": \"%s\"}".formatted(python));

        mockMvc.perform(get("/skills")).andExpect(jsonPath("$", hasSize(2)));
        mockMvc.perform(get("/skills").param("technologyId", java))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].label").value("Streams"));
    }

    @Test
    void skillsRequireAnExistingTechnology() throws Exception {
        mockMvc.perform(post("/skills").contentType(MediaType.APPLICATION_JSON)
                .content("{\"label\": \"Testing\", \"technologyId\": \"%s\"}".formatted(UUID.randomUUID())))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void deletingATechnologyDeletesItsSkills() throws Exception {
        final var java = createLabelled("/technologies", "Java");
        final var skill = create("/skills", "{\"label\": \"Streams\", \"technologyId\": \"%s\"}".formatted(java));

        mockMvc.perform(delete("/technologies/{id}", java)).andExpect(status().isNoContent());

        mockMvc.perform(get("/skills/{id}", skill)).andExpect(status().isNotFound());
    }

}
