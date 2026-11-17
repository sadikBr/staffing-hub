package com.brahimsadik.staffinghub.dtos.mission;

import org.jspecify.annotations.Nullable;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.enums.SkillLevel;

/**
 * How an assigned employee compares with one of the mission's required skills. Informational only.
 *
 * @param employeeLevel       null when the employee does not have the skill
 * @param meetsRequirement    true when the employee has the skill at the required level or above (any level when
 *                            none is required)
 */
public record RequiredSkillMatch(SkillResponse skill, @Nullable SkillLevel requiredLevel, @Nullable SkillLevel employeeLevel,
        boolean meetsRequirement) {
}
