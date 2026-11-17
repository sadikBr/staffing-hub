package com.brahimsadik.staffinghub.controllers;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
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

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeRolesRequest;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeTechnologiesRequest;
import com.brahimsadik.staffinghub.dtos.employeeskill.SetEmployeeSkillLevelRequest;
import com.brahimsadik.staffinghub.services.EmployeeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@Validated @RequestBody EmployeeCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        final var response = employeeService.create(request);
        final var location = uriBuilder.path("/employees/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    /** Paginated: {@code ?page=0&size=20&sort=lastName,asc}. Sorted by last then first name by default. */
    @GetMapping
    public PagedModel<EmployeeResponse> findAllEmployees(
            @SortDefault(sort = { "lastName", "firstName" }, direction = Sort.Direction.ASC) Pageable pageable) {
        return new PagedModel<>(employeeService.findAllEmployees(pageable));
    }

    @GetMapping("/{id}")
    public EmployeeResponse findEmployeeById(@PathVariable UUID id) {
        return employeeService.findEmployeeById(id);
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployeeById(@PathVariable UUID id,
            @Validated @RequestBody EmployeeCreationUpdateRequest request) {
        return employeeService.updateEmployeeById(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        employeeService.delete(id);
    }

    @PutMapping("/{id}/roles")
    public EmployeeResponse setEmployeeRoles(@PathVariable UUID id,
            @Validated @RequestBody SetEmployeeRolesRequest request) {
        return employeeService.setEmployeeRoles(id, request);
    }

    @PutMapping("/{id}/technologies")
    public EmployeeResponse setEmployeeTechnologies(@PathVariable UUID id,
            @Validated @RequestBody SetEmployeeTechnologiesRequest request) {
        return employeeService.setEmployeeTechnologies(id, request);
    }

    /** Adds the skill to the employee, or changes their level if they already have it. */
    @PutMapping("/{id}/skills/{skillId}")
    public EmployeeResponse setEmployeeSkillLevel(@PathVariable UUID id, @PathVariable UUID skillId,
            @Validated @RequestBody SetEmployeeSkillLevelRequest request) {
        return employeeService.setEmployeeSkillLevel(id, skillId, request);
    }

    @DeleteMapping("/{id}/skills/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeEmployeeSkill(@PathVariable UUID id, @PathVariable UUID skillId) {
        employeeService.removeEmployeeSkill(id, skillId);
    }

}
