package com.brahimsadik.staffinghub.dtos.mission;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

/**
 * New dates for an assignment, e.g. after dragging it on a timeline. {@code endDate} null: ongoing. {@code version}
 * is the version that was read: if the assignment changed since, the move is refused (409).
 */
public record AssignmentPeriodRequest(@NotNull LocalDate startDate, LocalDate endDate, Long version) {
}
