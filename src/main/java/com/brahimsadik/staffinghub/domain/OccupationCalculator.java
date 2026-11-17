package com.brahimsadik.staffinghub.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.TreeMap;

import com.brahimsadik.staffinghub.models.MissionAssignment;

/**
 * Computes how busy an employee is over a period from their mission assignments.
 * <p>
 * Rules:
 * <ul>
 * <li>An assignment without a start date is not scheduled yet and is ignored.</li>
 * <li>An assignment without an end date is ongoing: it lasts indefinitely.</li>
 * <li>An assignment without a rate is assumed to be full time (100%), so that nobody is double-booked by
 * accident.</li>
 * </ul>
 */
public final class OccupationCalculator {

    public static final BigDecimal FULL_TIME = BigDecimal.valueOf(100);

    private OccupationCalculator() {
    }

    /**
     * The highest total occupation rate on any single day between {@code from} and {@code to} (both included).
     * {@code to} may be null for an open-ended period. Returns 0 when no assignment overlaps the period.
     */
    public static BigDecimal peakRate(Collection<MissionAssignment> assignments, LocalDate from, LocalDate to) {
        // Change in total rate on each day where an assignment starts (+) or the day after one ends (-).
        final var changes = new TreeMap<LocalDate, BigDecimal>();

        for (final var assignment : assignments) {
            final var start = assignment.getStartDate();
            final var end = assignment.getEndDate();
            if (start == null || (to != null && start.isAfter(to)) || (end != null && end.isBefore(from))) {
                continue;
            }

            final var rate = assignment.getRate() == null ? FULL_TIME : assignment.getRate();
            changes.merge(start.isBefore(from) ? from : start, rate, BigDecimal::add);

            final var lastDay = end == null ? to : (to == null || end.isBefore(to) ? end : to);
            if (lastDay != null) {
                changes.merge(lastDay.plusDays(1), rate.negate(), BigDecimal::add);
            }
        }

        var current = BigDecimal.ZERO;
        var peak = BigDecimal.ZERO;
        for (final var change : changes.values()) {
            current = current.add(change);
            peak = peak.max(current);
        }
        return peak;
    }

    /** What is left once the peak occupation is taken: 100 - peak, never below 0. */
    public static BigDecimal availability(BigDecimal peakRate) {
        return FULL_TIME.subtract(peakRate).max(BigDecimal.ZERO);
    }

}
