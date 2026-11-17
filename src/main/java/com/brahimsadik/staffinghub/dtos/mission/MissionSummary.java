package com.brahimsadik.staffinghub.dtos.mission;

import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.customer.CustomerResponse;
import com.brahimsadik.staffinghub.enums.MissionStatus;

public record MissionSummary(UUID id, String label, String projectName, MissionStatus status,
        CustomerResponse customer) {
}
