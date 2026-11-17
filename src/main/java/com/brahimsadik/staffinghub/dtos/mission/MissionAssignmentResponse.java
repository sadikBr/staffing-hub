package com.brahimsadik.staffinghub.dtos.mission;

import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeSummary;

/** An assignment as seen from its mission. */
public record MissionAssignmentResponse(
        UUID id,
        EmployeeSummary employee,
        @Nullable LocalDate startDate,
        @Nullable LocalDate endDate,
        @Nullable Integer duration,
        @Nullable BigDecimal rate,
        @Nullable String appreciation,
        @Nullable String comment,
        List<RequiredSkillMatch> skillMatches,
        @Nullable AssignmentOccupation employeeOccupation,
        Long version,
        Instant createdAt,
        Instant updatedAt) {
}
