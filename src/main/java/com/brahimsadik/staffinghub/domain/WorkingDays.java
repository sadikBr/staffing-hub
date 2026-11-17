package com.brahimsadik.staffinghub.domain;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Collection;

import com.brahimsadik.staffinghub.models.Absence;

/** Counts working days (Monday to Friday; public holidays are not known to the application). */
public final class WorkingDays {

    private WorkingDays() {
    }

    /** Working days between {@code from} and {@code to}, both included. 0 when {@code to} is before {@code from}. */
    public static int between(LocalDate from, LocalDate to) {
        if (to.isBefore(from)) {
            return 0;
        }
        var count = 0;
        for (var day = from; !day.isAfter(to); day = day.plusDays(1)) {
            if (day.getDayOfWeek() != DayOfWeek.SATURDAY && day.getDayOfWeek() != DayOfWeek.SUNDAY) {
                count++;
            }
        }
        return count;
    }

    /**
     * Working days the employee is away between {@code from} and {@code to} (null: open-ended, every absence from
     * {@code from} on counts). Overlapping absences count each day once.
     */
    public static int absentBetween(Collection<Absence> absences, LocalDate from, LocalDate to) {
        final var lastDay = absences.stream().map(Absence::getEndDate).max(LocalDate::compareTo).orElse(from);
        final var end = to == null ? lastDay : to;
        var count = 0;
        for (var day = from; !day.isAfter(end); day = day.plusDays(1)) {
            if (day.getDayOfWeek() == DayOfWeek.SATURDAY || day.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            final var current = day;
            if (absences.stream().anyMatch(absence -> !current.isBefore(absence.getStartDate())
                    && !current.isAfter(absence.getEndDate()))) {
                count++;
            }
        }
        return count;
    }

}
