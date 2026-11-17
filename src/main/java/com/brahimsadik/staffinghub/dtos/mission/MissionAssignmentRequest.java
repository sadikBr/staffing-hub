package com.brahimsadik.staffinghub.dtos.mission;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Used for both creation and full replacement (PUT). {@code duration} is the number of days actually worked, which
 * may be less than the start/end period but not more. {@code rate} is the occupation rate as a percentage.
 */
public record MissionAssignmentRequest(
        @NotNull UUID employeeId,
        LocalDate startDate,
        LocalDate endDate,
        @Positive Integer duration,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("100") @Digits(integer = 3, fraction = 2) BigDecimal rate,
        @Size(max = 5000) String appreciation,
        @Size(max = 5000) String comment) {
}
