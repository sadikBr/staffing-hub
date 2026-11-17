package com.brahimsadik.staffinghub.dtos.skill;

import java.time.Instant;
import java.util.UUID;

public record SkillResponse(UUID id, String label, UUID technologyId, Long version, Instant createdAt,
        Instant updatedAt) {
}
