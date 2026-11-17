package com.brahimsadik.staffinghub.dtos.need;

import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.enums.Seniority;

/** @param filledBy null while the need is open */
public record MissionNeedResponse(
        UUID id,
        @Nullable RoleResponse role,
        @Nullable Seniority seniority,
        @Nullable LocalDate startDate,
        @Nullable LocalDate endDate,
        @Nullable BigDecimal rate,
        @Nullable String comment,
        @Nullable MissionNeedFill filledBy,
        Long version,
        Instant createdAt,
        Instant updatedAt) {
}
