package com.brahimsadik.staffinghub.dtos.technology;

import java.time.Instant;
import java.util.UUID;

public record TechnologyResponse(UUID id, String label, Long version, Instant createdAt, Instant updatedAt) {
}
