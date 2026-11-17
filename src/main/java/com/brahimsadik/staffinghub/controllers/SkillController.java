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

import com.brahimsadik.staffinghub.dtos.skill.SkillCreationUpdateRequest;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.services.SkillService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Skills", description = "Specific skills within a technology (e.g. Streams for Java).")
@RequiredArgsConstructor
@RequestMapping("/skills")
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    @Operation(summary = "Create a skill")
    public ResponseEntity<SkillResponse> create(@Validated @RequestBody SkillCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        final var response = skillService.create(request);
        final var location = uriBuilder.path("/skills/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "List all skills")
    public List<SkillResponse> findAllSkills() {
        return skillService.findAllSkills();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a skill by id")
    public SkillResponse findSkillById(@PathVariable UUID id) {
        return skillService.findSkillById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a skill")
    public SkillResponse updateSkillById(@PathVariable UUID id,
            @Validated @RequestBody SkillCreationUpdateRequest request) {
        return skillService.updateSkillById(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a skill (removes it from every employee)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        skillService.delete(id);
    }

}
