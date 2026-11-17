package com.brahimsadik.staffinghub.dtos.dashboard;

import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeSummary;
import com.brahimsadik.staffinghub.dtos.mission.MissionSummary;

public record EndingAssignment(UUID id, MissionSummary mission, EmployeeSummary employee, LocalDate endDate,
        @Nullable BigDecimal rate) {
}
