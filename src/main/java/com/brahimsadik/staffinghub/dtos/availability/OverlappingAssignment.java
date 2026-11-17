package com.brahimsadik.staffinghub.dtos.availability;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.mission.MissionSummary;

/** An assignment that overlaps the requested period. {@code rate} is null when unknown (counted as 100%). */
public record OverlappingAssignment(UUID id, MissionSummary mission, LocalDate startDate, LocalDate endDate,
        BigDecimal rate) {
}
