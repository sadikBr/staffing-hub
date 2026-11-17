package com.brahimsadik.staffinghub.dtos.mission;

import java.util.UUID;

import org.hibernate.validator.constraints.URL;

import com.brahimsadik.staffinghub.enums.BusinessUnit;
import com.brahimsadik.staffinghub.enums.MissionStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Used for both creation and full replacement (PUT). A missing or null {@code projectManagerId} means none. */
public record MissionCreationUpdateRequest(
        @NotBlank @Size(max = 255) String label,
        @NotBlank @Size(max = 255) String projectName,
        @Size(max = 5000) String description,
        @Size(max = 5000) String comment,
        @URL @Size(max = 500) String starUrl,
        BusinessUnit businessUnit,
        @NotNull MissionStatus status,
        @NotNull UUID customerId,
        UUID projectManagerId) {
}
