package com.brahimsadik.staffinghub.dtos.mission;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** An assignment as seen from the employee. */
public record EmployeeAssignmentResponse(
        UUID id,
        MissionSummary mission,
        LocalDate startDate,
        LocalDate endDate,
        Integer duration,
        BigDecimal rate,
        String appreciation,
        String comment,
        List<RequiredSkillMatch> skillMatches) {
}
