package com.brahimsadik.staffinghub.dtos.mission;

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
        String description,
        String comment,
        String starUrl,
        BusinessUnit businessUnit,
        MissionStatus status,
        CustomerResponse customer,
        EmployeeSummary projectManager,
        List<MissionSkillResponse> requiredSkills,
        List<MissionAssignmentResponse> assignments) {
}
