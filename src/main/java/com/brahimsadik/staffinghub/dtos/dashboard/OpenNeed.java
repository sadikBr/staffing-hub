package com.brahimsadik.staffinghub.dtos.dashboard;

import com.brahimsadik.staffinghub.dtos.mission.MissionSummary;
import com.brahimsadik.staffinghub.dtos.need.MissionNeedResponse;

/** An open position, with the mission it belongs to. */
public record OpenNeed(MissionSummary mission, MissionNeedResponse need) {
}
