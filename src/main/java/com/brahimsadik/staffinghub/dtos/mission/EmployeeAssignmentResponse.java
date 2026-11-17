package com.brahimsadik.staffinghub.dtos.mission;

import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** An assignment as seen from the employee. */
public record EmployeeAssignmentResponse(
        UUID id,
        MissionSummary mission,
        @Nullable LocalDate startDate,
        @Nullable LocalDate endDate,
        @Nullable Integer duration,
        @Nullable BigDecimal rate,
        @Nullable String appreciation,
        @Nullable String comment,
        List<RequiredSkillMatch> skillMatches,
        @Nullable AssignmentOccupation employeeOccupation) {
}
