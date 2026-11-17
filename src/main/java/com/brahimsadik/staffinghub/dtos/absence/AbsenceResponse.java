package com.brahimsadik.staffinghub.dtos.absence;

import org.jspecify.annotations.Nullable;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.AbsenceType;

/** @param workingDays the number of working days (Monday to Friday) in the absence */
public record AbsenceResponse(
        UUID id,
        AbsenceType type,
        LocalDate startDate,
        LocalDate endDate,
        int workingDays,
        @Nullable String comment,
        Long version,
        Instant createdAt,
        Instant updatedAt) {
}
