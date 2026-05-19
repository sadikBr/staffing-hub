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

import com.brahimsadik.staffinghub.dtos.role.RoleCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.services.RoleService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody RoleCreationUpdateRequest request, UriComponentsBuilder uriBuilder) {
        try {
            final var roleResponse = roleService.create(request);

            final var redirectUrl = uriBuilder.path("/roles/{id}").buildAndExpand(roleResponse.getId()).toUri();

            return ResponseEntity.created(redirectUrl).body(roleResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> findAllRoles() {
        final var roleResponses = roleService.findAllRoles();
        return ResponseEntity.ok(roleResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findRoleById(@PathVariable UUID id) {
        try {
            final var roleResponse = roleService.findRoleById(id);
            return ResponseEntity.ok(roleResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoleById(@PathVariable UUID id, @RequestBody RoleCreationUpdateRequest request) {
        try {
            final var roleResponse = roleService.updateRoleById(id, request);
            return ResponseEntity.ok(roleResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            roleService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }

    }

}
