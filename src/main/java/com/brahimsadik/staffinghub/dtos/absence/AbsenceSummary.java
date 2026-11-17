package com.brahimsadik.staffinghub.dtos.absence;

import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.AbsenceType;

/** An absence that overlaps a requested period. */
public record AbsenceSummary(UUID id, AbsenceType type, LocalDate startDate, LocalDate endDate) {
}
