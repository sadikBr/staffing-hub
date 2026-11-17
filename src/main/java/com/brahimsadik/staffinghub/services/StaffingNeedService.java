package com.brahimsadik.staffinghub.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.domain.OccupationCalculator;
import com.brahimsadik.staffinghub.dtos.availability.AvailabilityCriteria;
import com.brahimsadik.staffinghub.dtos.availability.EmployeeAvailabilityResponse;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeSearchCriteria;
import com.brahimsadik.staffinghub.dtos.mission.RequiredSkillMatch;
import com.brahimsadik.staffinghub.dtos.need.NeedCandidateResponse;
import com.brahimsadik.staffinghub.enums.Seniority;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.MissionMapper;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.models.Mission;
import com.brahimsadik.staffinghub.models.MissionNeed;
import com.brahimsadik.staffinghub.repositories.EmployeeRepository;
import com.brahimsadik.staffinghub.repositories.MissionRepository;

import lombok.RequiredArgsConstructor;

/** Ranks the employees who could fill a mission's open position. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffingNeedService {

    /** How well someone fits, before availability: these shares add up to 1. */
    static final double SKILLS_SHARE = 0.55;
    static final double SENIORITY_SHARE = 0.25;
    static final double ROLE_SHARE = 0.2;

    private static final EmployeeSearchCriteria ALL_ACTIVE = new EmployeeSearchCriteria(null, null, null, null, null,
            null, null, null, null, false);

    private final MissionRepository missionRepository;
    private final EmployeeRepository employeeRepository;
    private final AvailabilityService availabilityService;
    private final MissionMapper missionMapper;
    private final Clock clock;

    /**
     * The best candidates for the need, best first. Availability is computed over the need's period (from today when
     * it has no start date; open-ended when it has no end date).
     */
    public List<NeedCandidateResponse> findCandidates(UUID missionId, UUID needId, int limit) {
        final var mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResourceNotFoundException("mission", missionId));
        final var need = mission.findNeed(needId)
                .orElseThrow(() -> new ResourceNotFoundException("The mission has no need with the id " + needId));

        final var from = need.getStartDate() == null ? LocalDate.now(clock) : need.getStartDate();
        final var to = need.getEndDate();
        final var availability = availabilityService.computeAvailability(ALL_ACTIVE,
                AvailabilityCriteria.period(from, to));
        final var employees = employeeRepository.findAllById(availability.stream().map(EmployeeAvailabilityResponse::id)
                .toList()).stream().collect(Collectors.toMap(Employee::getId, Function.identity()));

        return availability.stream()
                .map(candidate -> toCandidate(candidate, employees.get(candidate.id()), mission, need, from, to))
                .sorted(Comparator.comparingInt(NeedCandidateResponse::score).reversed()
                        .thenComparing(NeedCandidateResponse::availability, Comparator.reverseOrder())
                        .thenComparing(NeedCandidateResponse::lastName))
                .limit(Math.clamp(limit, 1, 50))
                .toList();
    }

    private NeedCandidateResponse toCandidate(EmployeeAvailabilityResponse availability, Employee employee,
            Mission mission, MissionNeed need, LocalDate from, LocalDate to) {
        final var skillMatches = missionMapper.toSkillMatches(employee, mission);
        final var seniorityMatch = need.getSeniority() == null || need.getSeniority() == employee.getSeniority();
        final var roleMatch = need.getRole() == null
                || employee.getRoles().stream().anyMatch(role -> role.getId().equals(need.getRole().getId()));
        final var alreadyOnMission = employee.getAssignments().stream()
                .anyMatch(assignment -> assignment.getMission().getId().equals(mission.getId())
                        && !assignment.equals(need.getFilledBy())
                        && assignment.getStartDate() != null
                        && (to == null || !assignment.getStartDate().isAfter(to))
                        && (assignment.getEndDate() == null || !assignment.getEndDate().isBefore(from)));

        // Fit (skills, seniority, role) scaled by the share of the wanted time the person is free: a perfect match
        // who is fully booked cannot take the position.
        final var wanted = need.getRate() == null ? OccupationCalculator.FULL_TIME : need.getRate();
        final var availabilityScore = Math.min(availability.availability().doubleValue() / wanted.doubleValue(), 1);
        final var fit = SKILLS_SHARE * skillScore(skillMatches)
                + SENIORITY_SHARE * seniorityScore(need.getSeniority(), employee.getSeniority())
                + ROLE_SHARE * (roleMatch ? 1 : 0);
        final var score = 100 * availabilityScore * fit;

        return new NeedCandidateResponse(employee.getId(), employee.getFirstName(), employee.getLastName(),
                employee.getSeniority(), employee.getCommunity(),
                BigDecimal.valueOf(score).setScale(0, RoundingMode.HALF_UP).intValue(), availability.availability(),
                availability.peakOccupation(), availability.absentDays(), skillMatches, seniorityMatch, roleMatch,
                alreadyOnMission);
    }

    /** Average over the required skills: 1 when met, partial credit when below the level, 0 when missing. */
    static double skillScore(List<RequiredSkillMatch> matches) {
        if (matches.isEmpty()) {
            return 1;
        }
        return matches.stream().mapToDouble(match -> {
            if (match.meetsRequirement()) {
                return 1;
            }
            if (match.employeeLevel() == null) {
                return 0;
            }
            // Below the required level: credit in proportion of the levels reached.
            return 0.5 * (match.employeeLevel().ordinal() + 1) / (match.requiredLevel().ordinal() + 1);
        }).average().orElse(1);
    }

    /** 1 when no seniority is wanted or it matches, 0.5 one level away, 0 two levels away. */
    static double seniorityScore(Seniority wanted, Seniority actual) {
        if (wanted == null) {
            return 1;
        }
        return switch (Math.abs(wanted.ordinal() - actual.ordinal())) {
            case 0 -> 1;
            case 1 -> 0.5;
            default -> 0;
        };
    }

}
