package com.brahimsadik.staffinghub.dtos.mission;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeSummary;

/** An assignment as seen from its mission. */
public record MissionAssignmentResponse(
        UUID id,
        EmployeeSummary employee,
        LocalDate startDate,
        LocalDate endDate,
        Integer duration,
        BigDecimal rate,
        String appreciation,
        String comment,
        List<RequiredSkillMatch> skillMatches) {
}
