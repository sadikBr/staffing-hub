package com.brahimsadik.staffinghub.dtos.availability;

import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;

/**
 * An employee's occupation over the requested period.
 *
 * @param peakOccupation highest total occupation rate on any single day of the period, in percent
 * @param availability   what the employee can take on for the whole period: 100 - peakOccupation, never below 0.
 *                       0 when the employee leaves during the period.
 * @param overbooked     true when peakOccupation exceeds 100%
 * @param assignments    the assignments that overlap the period
 */
public record EmployeeAvailabilityResponse(
        UUID id,
        String firstName,
        String lastName,
        Seniority seniority,
        Community community,
        @Nullable LocalDate departureDate,
        BigDecimal peakOccupation,
        BigDecimal availability,
        boolean overbooked,
        List<OverlappingAssignment> assignments) {
}
