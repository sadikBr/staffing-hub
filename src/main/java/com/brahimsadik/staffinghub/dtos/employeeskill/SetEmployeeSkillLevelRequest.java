package com.brahimsadik.staffinghub.dtos.employeeskill;

import com.brahimsadik.staffinghub.enums.SkillLevel;

import jakarta.validation.constraints.NotNull;

public record SetEmployeeSkillLevelRequest(@NotNull SkillLevel level) {
}
