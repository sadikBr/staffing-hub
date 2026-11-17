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

import com.brahimsadik.staffinghub.dtos.role.RoleCreationUpdateRequest;

import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.services.RoleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Roles", description = "Job roles an employee can hold (e.g. Tech Lead, Developer).")
@RequiredArgsConstructor
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @Operation(summary = "Create a role")
    public ResponseEntity<RoleResponse> create(@Validated @RequestBody RoleCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        final var response = roleService.create(request);
        final var location = uriBuilder.path("/roles/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "List all roles")
    public List<RoleResponse> findAllRoles() {
        return roleService.findAllRoles();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a role by id")
    public RoleResponse findRoleById(@PathVariable UUID id) {
        return roleService.findRoleById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a role")
    public RoleResponse updateRoleById(@PathVariable UUID id,
            @Validated @RequestBody RoleCreationUpdateRequest request) {
        return roleService.updateRoleById(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a role")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        roleService.delete(id);
    }

}
