package com.brahimsadik.staffinghub.controllers;

import java.util.List;
import java.util.UUID;

import org.springdoc.core.annotations.ParameterObject;
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

import com.brahimsadik.staffinghub.dtos.availability.AvailabilityCriteria;
import com.brahimsadik.staffinghub.dtos.availability.EmployeeAvailabilityResponse;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeSearchCriteria;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeRolesRequest;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeTechnologiesRequest;
import com.brahimsadik.staffinghub.dtos.employeeskill.SetEmployeeSkillLevelRequest;
import com.brahimsadik.staffinghub.dtos.mission.EmployeeAssignmentResponse;
import com.brahimsadik.staffinghub.services.AvailabilityService;
import com.brahimsadik.staffinghub.services.EmployeeService;
import com.brahimsadik.staffinghub.services.MissionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Employees", description = "Employees, their manager, roles, technologies and skill levels.")
@RequiredArgsConstructor
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final MissionService missionService;
    private final AvailabilityService availabilityService;

    @PostMapping
    @Operation(summary = "Create an employee")
    public ResponseEntity<EmployeeResponse> create(@Validated @RequestBody EmployeeCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        final var response = employeeService.create(request);
        final var location = uriBuilder.path("/api/employees/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    /** Paginated: {@code ?page=0&size=20&sort=lastName,asc}. Sorted by last then first name by default. */
    @GetMapping
    @Operation(summary = "Search employees (paginated); every filter is optional, former employees are hidden by default")
    public PagedModel<EmployeeResponse> searchEmployees(@ParameterObject EmployeeSearchCriteria criteria,
            @ParameterObject @SortDefault(sort = { "lastName", "firstName" }, direction = Sort.Direction.ASC) Pageable pageable) {
        return new PagedModel<>(employeeService.searchEmployees(criteria, pageable));
    }

    @GetMapping("/availability")
    @Operation(summary = "Find who is available over a period, most available first (paginated)",
            description = """
                    Accepts the same filters as the employee search. Availability is what the employee can take on \
                    for the whole period: 100% minus their peak occupation on any single day. Assignments without \
                    a start date are ignored, without an end date are ongoing, and without a rate count as 100%. \
                    An employee who leaves during the period has 0% availability.""")
    public PagedModel<EmployeeAvailabilityResponse> findAvailability(@ParameterObject EmployeeSearchCriteria search,
            @ParameterObject @Validated AvailabilityCriteria period, @ParameterObject Pageable pageable) {
        return new PagedModel<>(availabilityService.findAvailability(search, period, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an employee by id")
    public EmployeeResponse findEmployeeById(@PathVariable UUID id) {
        return employeeService.findEmployeeById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace an employee's details and manager")
    public EmployeeResponse updateEmployeeById(@PathVariable UUID id,
            @Validated @RequestBody EmployeeCreationUpdateRequest request) {
        return employeeService.updateEmployeeById(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an employee (their staff are kept, without a manager; refused if they have mission assignments)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        employeeService.delete(id);
    }

    @PutMapping("/{id}/roles")
    @Operation(summary = "Set all of an employee's roles")
    public EmployeeResponse setEmployeeRoles(@PathVariable UUID id,
            @Validated @RequestBody SetEmployeeRolesRequest request) {
        return employeeService.setEmployeeRoles(id, request);
    }

    @PutMapping("/{id}/technologies")
    @Operation(summary = "Set all of an employee's technologies (removes skills in dropped ones)")
    public EmployeeResponse setEmployeeTechnologies(@PathVariable UUID id,
            @Validated @RequestBody SetEmployeeTechnologiesRequest request) {
        return employeeService.setEmployeeTechnologies(id, request);
    }

    /** Adds the skill to the employee, or changes their level if they already have it. */
    @PutMapping("/{id}/skills/{skillId}")
    @Operation(summary = "Add a skill to an employee, or change its level")
    public EmployeeResponse setEmployeeSkillLevel(@PathVariable UUID id, @PathVariable UUID skillId,
            @Validated @RequestBody SetEmployeeSkillLevelRequest request) {
        return employeeService.setEmployeeSkillLevel(id, skillId, request);
    }

    @DeleteMapping("/{id}/skills/{skillId}")
    @Operation(summary = "Remove a skill from an employee")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeEmployeeSkill(@PathVariable UUID id, @PathVariable UUID skillId) {
        employeeService.removeEmployeeSkill(id, skillId);
    }

    @GetMapping("/{id}/assignments")
    @Operation(summary = "List an employee's mission assignments, most recent first")
    public List<EmployeeAssignmentResponse> findEmployeeAssignments(@PathVariable UUID id) {
        return missionService.findAssignmentsOfEmployee(id);
    }

}
