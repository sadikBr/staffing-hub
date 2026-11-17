package com.brahimsadik.staffinghub.services;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.availability.AvailabilityCriteria;
import com.brahimsadik.staffinghub.dtos.dashboard.DashboardResponse;
import com.brahimsadik.staffinghub.dtos.dashboard.EndingAssignment;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeSearchCriteria;
import com.brahimsadik.staffinghub.enums.MissionStatus;
import com.brahimsadik.staffinghub.mappers.EmployeeMapper;
import com.brahimsadik.staffinghub.mappers.MissionMapper;
import com.brahimsadik.staffinghub.repositories.MissionAssignmentRepository;
import com.brahimsadik.staffinghub.repositories.MissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    public static final int HORIZON_DAYS = 30;
    private static final BigDecimal AVAILABLE_THRESHOLD = BigDecimal.valueOf(50);
    private static final EmployeeSearchCriteria ALL_ACTIVE = new EmployeeSearchCriteria(null, null, null, null, null,
            null, null, null, false);

    private final AvailabilityService availabilityService;
    private final MissionRepository missionRepository;
    private final MissionAssignmentRepository missionAssignmentRepository;
    private final MissionMapper missionMapper;
    private final EmployeeMapper employeeMapper;
    private final Clock clock;

    public DashboardResponse getDashboard() {
        final var from = LocalDate.now(clock);
        final var to = from.plusDays(HORIZON_DAYS - 1L);

        final var availability = availabilityService.computeAvailability(ALL_ACTIVE,
                new AvailabilityCriteria(from, to, null));
        final var available = availability.stream()
                .filter(employee -> employee.availability().compareTo(AVAILABLE_THRESHOLD) >= 0).toList();
        final var overbooked = availability.stream().filter(employee -> employee.overbooked()).toList();

        final var missionsByStatus = new EnumMap<MissionStatus, Long>(MissionStatus.class);
        Arrays.stream(MissionStatus.values()).forEach(status -> missionsByStatus.put(status, 0L));
        missionRepository.countByStatus()
                .forEach(row -> missionsByStatus.put((MissionStatus) row[0], (Long) row[1]));

        final var endingSoon = missionAssignmentRepository.findByEndDateBetweenOrderByEndDateAsc(from, to).stream()
                .limit(10)
                .map(assignment -> new EndingAssignment(assignment.getId(),
                        missionMapper.toMissionSummary(assignment.getMission()),
                        employeeMapper.toEmployeeSummary(assignment.getEmployee()), assignment.getEndDate(),
                        assignment.getRate()))
                .toList();

        return new DashboardResponse(from, to, HORIZON_DAYS, availability.size(), available.size(),
                overbooked.size(), missionsByStatus, available.stream().limit(5).toList(),
                overbooked.stream().limit(5).toList(), endingSoon);
    }

}
