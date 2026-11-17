package com.brahimsadik.staffinghub.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.domain.OccupationCalculator;
import com.brahimsadik.staffinghub.domain.WorkingDays;
import com.brahimsadik.staffinghub.dtos.availability.AvailabilityCriteria;
import com.brahimsadik.staffinghub.dtos.availability.EmployeeAvailabilityResponse;
import com.brahimsadik.staffinghub.dtos.availability.OverlappingAssignment;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeSearchCriteria;
import com.brahimsadik.staffinghub.exceptions.BusinessRuleViolationException;
import com.brahimsadik.staffinghub.mappers.AbsenceMapper;
import com.brahimsadik.staffinghub.mappers.MissionMapper;
import com.brahimsadik.staffinghub.models.Absence;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.models.MissionAssignment;
import com.brahimsadik.staffinghub.repositories.EmployeeRepository;
import com.brahimsadik.staffinghub.repositories.EmployeeSpecifications;

import lombok.RequiredArgsConstructor;

/** Answers "who is available, and how much, over this period?". */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvailabilityService {

    private static final Comparator<EmployeeAvailabilityResponse> MOST_AVAILABLE_FIRST = Comparator
            .comparing(EmployeeAvailabilityResponse::availability).reversed()
            .thenComparing(EmployeeAvailabilityResponse::lastName)
            .thenComparing(EmployeeAvailabilityResponse::firstName);

    private final EmployeeRepository employeeRepository;
    private final MissionMapper missionMapper;
    private final AbsenceMapper absenceMapper;

    /**
     * Employees matching the search criteria, with their occupation over the period, most available first.
     * <p>
     * Occupation has to be computed per day from each employee's assignments, so the filtering and paging on
     * availability happen in memory. That is fine at the scale of a company's workforce (thousands of employees).
     */
    public Page<EmployeeAvailabilityResponse> findAvailability(EmployeeSearchCriteria search,
            AvailabilityCriteria period, Pageable pageable) {
        final var matching = computeAvailability(search, period);
        final var fromIndex = (int) Math.min(pageable.getOffset(), matching.size());
        final var toIndex = Math.min(fromIndex + pageable.getPageSize(), matching.size());
        return new PageImpl<>(matching.subList(fromIndex, toIndex), pageable, matching.size());
    }

    /** Same as {@link #findAvailability}, without paging. */
    public List<EmployeeAvailabilityResponse> computeAvailability(EmployeeSearchCriteria search,
            AvailabilityCriteria period) {
        EmployeeService.validate(search);
        if (period.to() != null && period.to().isBefore(period.from())) {
            throw new BusinessRuleViolationException("'to' cannot be before 'from'");
        }

        // An employee who has left by the first day of the period is never available, unless asked for.
        final var employees = employeeRepository.findAll(EmployeeSpecifications.matching(search, period.from()),
                Sort.by("lastName", "firstName"));

        return employees.stream()
                .map(employee -> toAvailability(employee, period.from(), period.to()))
                .filter(availability -> period.minAvailability() == null
                        || availability.availability().compareTo(period.minAvailability()) >= 0)
                .sorted(MOST_AVAILABLE_FIRST)
                .toList();
    }

    private EmployeeAvailabilityResponse toAvailability(Employee employee, LocalDate from, LocalDate to) {
        final var peak = OccupationCalculator.peakRate(employee.getAssignments(), from, to);
        final var absences = employee.getAbsences().stream().filter(absence -> absence.overlaps(from, to))
                .sorted(Comparator.comparing(Absence::getStartDate)).toList();
        final var absentDays = WorkingDays.absentBetween(absences, from, to);
        final var leavesDuringPeriod = employee.getDepartureDate() != null
                && (to == null || !employee.getDepartureDate().isAfter(to));
        final var availability = leavesDuringPeriod ? BigDecimal.ZERO
                : OccupationCalculator.availability(peak, absentDays, to == null ? 0 : WorkingDays.between(from, to));

        final List<OverlappingAssignment> overlapping = employee.getAssignments().stream()
                .filter(assignment -> overlaps(assignment, from, to))
                .sorted(Comparator.comparing(MissionAssignment::getStartDate))
                .map(assignment -> new OverlappingAssignment(assignment.getId(),
                        missionMapper.toMissionSummary(assignment.getMission()), assignment.getStartDate(),
                        assignment.getEndDate(), assignment.getRate(), assignment.getVersion()))
                .toList();

        return new EmployeeAvailabilityResponse(employee.getId(), employee.getFirstName(), employee.getLastName(),
                employee.getSeniority(), employee.getCommunity(), employee.getDepartureDate(), peak, availability,
                peak.compareTo(OccupationCalculator.FULL_TIME) > 0, absentDays, overlapping,
                absences.stream().map(absenceMapper::toAbsenceSummary).toList());
    }

    private static boolean overlaps(MissionAssignment assignment, LocalDate from, LocalDate to) {
        return assignment.getStartDate() != null
                && (to == null || !assignment.getStartDate().isAfter(to))
                && (assignment.getEndDate() == null || !assignment.getEndDate().isBefore(from));
    }

}
