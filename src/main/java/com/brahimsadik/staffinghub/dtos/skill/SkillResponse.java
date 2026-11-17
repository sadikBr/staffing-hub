package com.brahimsadik.staffinghub.dtos.skill;

import java.util.UUID;

public record SkillResponse(UUID id, String label, UUID technologyId) {
}
