package com.brahimsadik.staffinghub.dtos.need;

import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeSummary;

/** The assignment that filled a need, and who it is. */
public record MissionNeedFill(UUID assignmentId, EmployeeSummary employee) {
}
