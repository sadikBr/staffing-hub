package com.brahimsadik.staffinghub.dtos.employee;

import java.util.UUID;

import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;
import com.brahimsadik.staffinghub.enums.SkillLevel;

import io.swagger.v3.oas.annotations.Parameter;

/** Optional filters for searching employees, combined with AND. Bound from query parameters. */
public record EmployeeSearchCriteria(
        @Parameter(description = "Part of the first and/or last name, case-insensitive (e.g. \"ada\", \"ada love\")")
        String search,
        Seniority seniority,
        Community community,
        @Parameter(description = "Only employees with this role")
        UUID roleId,
        @Parameter(description = "Only employees with this technology")
        UUID technologyId,
        @Parameter(description = "Only employees with this skill")
        UUID skillId,
        @Parameter(description = "With skillId: only employees at this level or above")
        SkillLevel minSkillLevel,
        @Parameter(description = "Only the staff of this manager (direct reports, unless includeIndirectReports)")
        UUID managerId,
        @Parameter(description = "With managerId: also their staff's staff, and so on down the hierarchy (default false)")
        Boolean includeIndirectReports,
        @Parameter(description = "Include employees whose departure date has passed (default false)")
        Boolean includeFormer) {

    public boolean includeFormerEmployees() {
        return Boolean.TRUE.equals(includeFormer);
    }

    public boolean wholeTeam() {
        return managerId != null && Boolean.TRUE.equals(includeIndirectReports);
    }

}
