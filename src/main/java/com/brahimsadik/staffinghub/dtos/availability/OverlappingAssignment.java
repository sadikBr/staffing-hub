package com.brahimsadik.staffinghub.dtos.availability;

import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.mission.MissionSummary;

/**
 * An assignment that overlaps the requested period. {@code rate} is null when unknown (counted as 100%).
 * {@code version} allows moving the assignment's dates from the availability view.
 */
public record OverlappingAssignment(UUID id, MissionSummary mission, LocalDate startDate, @Nullable LocalDate endDate,
        @Nullable BigDecimal rate, Long version) {
}
