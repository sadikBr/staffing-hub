package com.brahimsadik.staffinghub.dtos.mission;

import org.jspecify.annotations.Nullable;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.enums.SkillLevel;

public record MissionSkillResponse(SkillResponse skill, @Nullable SkillLevel requiredLevel) {
}
