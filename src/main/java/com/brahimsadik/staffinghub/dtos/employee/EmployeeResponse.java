package com.brahimsadik.staffinghub.dtos.employee;

import org.jspecify.annotations.Nullable;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillResponse;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;

/**
 * The manager and staff are summaries rather than nested employees, so responses stay small and can never recurse.
 */
public record EmployeeResponse(
        UUID id,
        String firstName,
        String lastName,
        @Nullable String comment,
        Seniority seniority,
        Community community,
        @Nullable LocalDate departureDate,
        @Nullable EmployeeSummary manager,
        List<EmployeeSummary> staff,
        List<RoleResponse> roles,
        List<TechnologyResponse> technologies,
        List<EmployeeSkillResponse> skills,
        Long version,
        Instant createdAt,
        Instant updatedAt) {
}
