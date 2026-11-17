package com.brahimsadik.staffinghub.dtos.absence;

import java.time.LocalDate;

import com.brahimsadik.staffinghub.enums.AbsenceType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Used for both creation and full replacement (PUT). Both days are included. On update, {@code version} is the
 * version that was read: if the absence changed since, the update is refused (409).
 */
public record AbsenceRequest(
        @NotNull AbsenceType type,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @Size(max = 5000) String comment,
        Long version) {
}
