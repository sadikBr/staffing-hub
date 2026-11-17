package com.brahimsadik.staffinghub.dtos.mission;

import java.math.BigDecimal;

/**
 * How busy the assigned employee is over this assignment's period, counting all of their assignments (this one
 * included). Informational only: overbooking is reported, never rejected. Null when the assignment has no start date.
 *
 * @param peakRate   highest total occupation rate on any single day of the period, in percent
 * @param overbooked true when the peak rate exceeds 100%
 */
public record AssignmentOccupation(BigDecimal peakRate, boolean overbooked) {
}
