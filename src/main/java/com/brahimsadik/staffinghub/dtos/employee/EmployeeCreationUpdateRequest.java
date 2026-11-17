package com.brahimsadik.staffinghub.dtos.employee;

import java.time.LocalDate;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Used for both creation and full replacement (PUT). {@code managerId} is optional: leaving it out or sending null
 * means the employee has no manager. {@code departureDate} is optional: set it when the employee leaves (or will
 * leave); they are then hidden from searches by default from that date, but keep their history. On update,
 * {@code version} is the version that was read: if the employee changed since, the update is refused (409).
 */
public record EmployeeCreationUpdateRequest(
        @NotBlank @Size(max = 255) String firstName,
        @NotBlank @Size(max = 255) String lastName,
        @Size(max = 5000) String comment,
        @NotNull Seniority seniority,
        @NotNull Community community,
        UUID managerId,
        LocalDate departureDate,
        Long version) {
}
