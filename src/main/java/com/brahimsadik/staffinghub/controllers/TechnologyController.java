package com.brahimsadik.staffinghub.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.brahimsadik.staffinghub.dtos.technology.TechnologyCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyWithSkillsResponse;
import com.brahimsadik.staffinghub.services.TechnologyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Technologies", description = "Technologies (e.g. Java, React) and the skills grouped under each one.")
@RequiredArgsConstructor
@RequestMapping("/technologies")
public class TechnologyController {

    private final TechnologyService technologyService;

    @PostMapping
    @Operation(summary = "Create a technology")
    public ResponseEntity<TechnologyResponse> create(@Validated @RequestBody TechnologyCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        final var response = technologyService.create(request);
        final var location = uriBuilder.path("/api/technologies/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "List all technologies, with their skills")
    public List<TechnologyWithSkillsResponse> findAllTechnologies() {
        return technologyService.findAllTechnologies();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a technology by id, with its skills")
    public TechnologyWithSkillsResponse findTechnologyById(@PathVariable UUID id) {
        return technologyService.findTechnologyById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a technology")
    public TechnologyResponse updateTechnologyById(@PathVariable UUID id,
            @Validated @RequestBody TechnologyCreationUpdateRequest request) {
        return technologyService.updateTechnologyById(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a technology (and its skills)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        technologyService.delete(id);
    }

}
