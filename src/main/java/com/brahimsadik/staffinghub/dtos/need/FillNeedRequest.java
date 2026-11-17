package com.brahimsadik.staffinghub.dtos.need;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/** Fills a need by assigning this employee to the mission, with the need's dates and rate. */
public record FillNeedRequest(@NotNull UUID employeeId) {
}
