package com.brahimsadik.staffinghub.dtos.mission;

import com.brahimsadik.staffinghub.enums.SkillLevel;

/** {@code requiredLevel} is optional: null (or no body at all) means any level is fine. */
public record SetMissionSkillRequest(SkillLevel requiredLevel) {
}
