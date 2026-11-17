package com.brahimsadik.staffinghub.dtos.employee;

import java.util.Set;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/**
 * Replaces all of an employee's technologies. The employee's skills in technologies that are removed are removed
 * too.
 */
public record SetEmployeeTechnologiesRequest(@NotNull Set<@NotNull UUID> technologyIds) {
}
