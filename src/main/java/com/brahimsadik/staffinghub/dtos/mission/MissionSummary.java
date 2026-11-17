package com.brahimsadik.staffinghub.dtos.mission;

import org.jspecify.annotations.Nullable;

import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.enums.MissionStatus;

public record MissionSummary(UUID id, String label, String projectName, @Nullable String description,
        MissionStatus status, CustomerResponse customer) {
}
