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

import com.brahimsadik.staffinghub.dtos.technology.TechnologyCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.services.TechnologyService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/technologies")
public class TechnologyController {

    private final TechnologyService technologyService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TechnologyCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        try {
            final var technologyResponse = technologyService.create(request);

            final var redirectUrl = uriBuilder.path("/technologies/{id}").buildAndExpand(technologyResponse.getId())
                    .toUri();

            return ResponseEntity.created(redirectUrl).body(technologyResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TechnologyResponse>> findAllTechnologies() {
        final var technologyResponses = technologyService.findAllTechnologies();
        return ResponseEntity.ok(technologyResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findTechnologyById(@PathVariable UUID id) {
        try {
            final var technologyResponse = technologyService.findTechnologyById(id);
            return ResponseEntity.ok(technologyResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoleById(@PathVariable UUID id,
            @RequestBody TechnologyCreationUpdateRequest request) {
        try {
            final var technologyResponse = technologyService.updateTechnologyById(id, request);
            return ResponseEntity.ok(technologyResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            technologyService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }

    }

}
