package com.brahimsadik.staffinghub.dtos.employeeskill;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.enums.SkillLevel;

public record EmployeeSkillResponse(SkillResponse skill, SkillLevel level) {
}
