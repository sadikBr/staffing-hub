package com.brahimsadik.staffinghub.dtos.mission;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.enums.SkillLevel;

public record MissionSkillResponse(SkillResponse skill, SkillLevel requiredLevel) {
}
