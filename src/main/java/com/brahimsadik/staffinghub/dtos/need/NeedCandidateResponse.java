package com.brahimsadik.staffinghub.dtos.need;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.mission.RequiredSkillMatch;
import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;

/**
 * An employee who could fill a need, and how well they fit. Informational: anyone can be assigned.
 *
 * @param score            from 0 to 100: how well the employee fits (required skills 55%, seniority 25%, role 20%),
 *                         multiplied by the share of the wanted time they are free over the need's period. A
 *                         criterion the need does not specify counts as met.
 * @param availability     what the employee can take on over the need's period, in percent
 * @param absentDays       working days the employee is away during the need's period
 * @param skillMatches     how the employee compares with each of the mission's required skills
 * @param seniorityMatch   true when the need has no seniority or the employee has it
 * @param roleMatch        true when the need has no role or the employee has it
 * @param alreadyOnMission true when the employee is already assigned to the mission during the need's period
 */
public record NeedCandidateResponse(
        UUID id,
        String firstName,
        String lastName,
        Seniority seniority,
        Community community,
        int score,
        BigDecimal availability,
        BigDecimal peakOccupation,
        int absentDays,
        List<RequiredSkillMatch> skillMatches,
        boolean seniorityMatch,
        boolean roleMatch,
        boolean alreadyOnMission) {
}
