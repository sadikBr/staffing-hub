package com.brahimsadik.staffinghub.dtos.employee;

import java.util.UUID;

import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Used for both creation and full replacement (PUT). {@code managerId} is optional: leaving it out or sending null
 * means the employee has no manager.
 */
public record EmployeeCreationUpdateRequest(
        @NotBlank @Size(max = 255) String firstName,
        @NotBlank @Size(max = 255) String lastName,
        @Size(max = 5000) String comment,
        @NotNull Seniority seniority,
        @NotNull Community community,
        UUID managerId) {
}
