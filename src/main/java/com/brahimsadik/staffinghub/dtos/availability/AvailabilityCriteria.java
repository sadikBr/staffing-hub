package com.brahimsadik.staffinghub.dtos.availability;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/** The period to check, and optionally how much availability is needed. Bound from query parameters. */
public record AvailabilityCriteria(
        @Parameter(description = "First day of the period (included)", required = true, example = "2026-01-01")
        @NotNull LocalDate from,
        @Parameter(description = "Last day of the period (included); leave empty for an open-ended period", example = "2026-03-31")
        LocalDate to,
        @Parameter(description = "Only employees with at least this availability (percent) over the whole period")
        @DecimalMin("0") @DecimalMax("100") BigDecimal minAvailability) {
}
