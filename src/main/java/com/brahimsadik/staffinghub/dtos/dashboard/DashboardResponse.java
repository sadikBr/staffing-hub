package com.brahimsadik.staffinghub.dtos.dashboard;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.brahimsadik.staffinghub.dtos.availability.EmployeeAvailabilityResponse;
import com.brahimsadik.staffinghub.enums.MissionStatus;

/**
 * The staffing situation at a glance, over the next {@code horizonDays} days (from {@code from} to {@code to}).
 *
 * @param activeEmployees        employees who have not left
 * @param availableEmployees     active employees at least 50% available over the whole horizon
 * @param overbookedEmployees    active employees above 100% on at least one day of the horizon
 * @param missionsByStatus       number of missions in each status (every status present, possibly 0)
 * @param mostAvailable          the most available employees over the horizon (at most 5)
 * @param overbooked             the overbooked employees (at most 5)
 * @param assignmentsEndingSoon  assignments ending during the horizon, soonest first (at most 10)
 * @param openNeedCount          open positions on prospect, confirmed and ongoing missions
 * @param openNeeds              those open positions, soonest first (at most 8)
 */
public record DashboardResponse(
        LocalDate from,
        LocalDate to,
        int horizonDays,
        int activeEmployees,
        int availableEmployees,
        int overbookedEmployees,
        Map<MissionStatus, Long> missionsByStatus,
        List<EmployeeAvailabilityResponse> mostAvailable,
        List<EmployeeAvailabilityResponse> overbooked,
        List<EndingAssignment> assignmentsEndingSoon,
        int openNeedCount,
        List<OpenNeed> openNeeds) {
}
