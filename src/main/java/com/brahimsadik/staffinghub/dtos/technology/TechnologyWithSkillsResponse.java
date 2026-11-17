package com.brahimsadik.staffinghub.dtos.technology;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;

public record TechnologyWithSkillsResponse(UUID id, String label, List<SkillResponse> skills, Long version,
        Instant createdAt, Instant updatedAt) {
}
