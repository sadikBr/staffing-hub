package com.brahimsadik.staffinghub.controllers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.brahimsadik.staffinghub.dtos.skill.SkillCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.services.SkillService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/skills")
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SkillCreationUpdateRequest request, UriComponentsBuilder uriBuilder) {
        try {
            final var skillResponse = skillService.create(request);

            final var redirectUrl = uriBuilder.path("/skills/{id}").buildAndExpand(skillResponse.getId()).toUri();

            return ResponseEntity.created(redirectUrl).body(skillResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<SkillResponse>> findAllSkills() {
        final var skillResponses = skillService.findAllSkills();
        return ResponseEntity.ok(skillResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findSkillById(@PathVariable UUID id) {
        try {
            final var skillResponse = skillService.findSkillById(id);
            return ResponseEntity.ok(skillResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkillById(@PathVariable UUID id, @RequestBody SkillCreationUpdateRequest request) {
        try {
            final var skillResponse = skillService.updateSkillById(id, request);
            return ResponseEntity.ok(skillResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            skillService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }

    }

}
