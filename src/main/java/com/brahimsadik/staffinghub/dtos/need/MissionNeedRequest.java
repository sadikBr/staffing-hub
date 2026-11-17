package com.brahimsadik.staffinghub.dtos.need;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.Seniority;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

/**
 * An open position on a mission. Every field is optional: a need can be as vague as "someone". {@code rate} is the
 * occupation wanted, as a percentage (100 when empty). Used for creation and full replacement (PUT); on update,
 * {@code version} is the version that was read.
 */
public record MissionNeedRequest(
        UUID roleId,
        Seniority seniority,
        LocalDate startDate,
        LocalDate endDate,
        @DecimalMin(value = "0", inclusive = false) @DecimalMax("100") @Digits(integer = 3, fraction = 2) BigDecimal rate,
        @Size(max = 5000) String comment,
        Long version) {
}
