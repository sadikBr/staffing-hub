package com.brahimsadik.staffinghub.controllers;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeRolesRequest;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeTechnologiesRequest;
import com.brahimsadik.staffinghub.services.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EmployeeCreationUpdateRequest request, UriComponentsBuilder uriBuilder) {
        try {
            final var employeeResponse = employeeService.create(request);

            final var redirectUrl = uriBuilder.path("/employees/{id}").buildAndExpand(employeeResponse.getId()).toUri();

            return ResponseEntity.created(redirectUrl).body(employeeResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> findAllEmployees() {
        final var employeeResponse = employeeService.findAllEmployees();
        return ResponseEntity.ok(employeeResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findEmployeeById(@PathVariable UUID id) {
        try {
            final var employeeResponse = employeeService.findEmployeeById(id);
            return ResponseEntity.ok(employeeResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkillById(@PathVariable UUID id, @RequestBody EmployeeCreationUpdateRequest request) {
        try {
            final var employeeResponse = employeeService.updateEmployeeById(id, request);
            return ResponseEntity.ok(employeeResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            employeeService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<?> setEmployeeRoles(@PathVariable UUID id, @RequestBody SetEmployeeRolesRequest request) {
        try {
            final var employeeResponse = employeeService.setEmployeeRoles(id, request);
            return ResponseEntity.ok(employeeResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/technologies")
    public ResponseEntity<?> setEmployeeTechnologies(@PathVariable UUID id, @RequestBody SetEmployeeTechnologiesRequest request) {
        try {
            final var employeeResponse = employeeService.setEmployeeTechnologies(id, request);
            return ResponseEntity.ok(employeeResponse);
        } catch (final RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

}
