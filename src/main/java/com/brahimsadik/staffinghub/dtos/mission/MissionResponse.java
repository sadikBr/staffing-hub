package com.brahimsadik.staffinghub.dtos.mission;

import org.jspecify.annotations.Nullable;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeSummary;
import com.brahimsadik.staffinghub.enums.BusinessUnit;
import com.brahimsadik.staffinghub.enums.MissionStatus;

public record MissionResponse(
        UUID id,
        String label,
        String projectName,
        @Nullable String description,
        @Nullable String comment,
        @Nullable String starUrl,
        @Nullable BusinessUnit businessUnit,
        MissionStatus status,
        CustomerResponse customer,
        @Nullable EmployeeSummary projectManager,
        List<MissionSkillResponse> requiredSkills,
        List<MissionAssignmentResponse> assignments,
        Long version,
        Instant createdAt,
        Instant updatedAt) {
}
