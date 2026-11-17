package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.absence.AbsenceRequest;
import com.brahimsadik.staffinghub.dtos.absence.AbsenceResponse;
import com.brahimsadik.staffinghub.exceptions.BusinessRuleViolationException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.AbsenceMapper;
import com.brahimsadik.staffinghub.models.Absence;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.repositories.AbsenceRepository;
import com.brahimsadik.staffinghub.repositories.EmployeeRepository;

import lombok.RequiredArgsConstructor;

/** An employee's absences. They reduce availability but never block assignments. */
@Service
@RequiredArgsConstructor
@Transactional
public class AbsenceService {

    private final EmployeeRepository employeeRepository;
    private final AbsenceRepository absenceRepository;
    private final AbsenceMapper absenceMapper;

    /** Most recent first. */
    @Transactional(readOnly = true)
    public List<AbsenceResponse> findAbsences(UUID employeeId) {
        getEmployee(employeeId);
        return absenceRepository.findByEmployeeIdOrderByStartDateDesc(employeeId).stream()
                .map(absenceMapper::toAbsenceResponse).toList();
    }

    public AbsenceResponse create(UUID employeeId, AbsenceRequest request) {
        final var employee = getEmployee(employeeId);
        checkPeriod(employee, request, null);
        final var absence = absenceMapper.toAbsence(request);
        absence.setEmployee(employee);
        employee.getAbsences().add(absence);
        return absenceMapper.toAbsenceResponse(absenceRepository.saveAndFlush(absence));
    }

    public AbsenceResponse update(UUID employeeId, UUID absenceId, AbsenceRequest request) {
        final var employee = getEmployee(employeeId);
        final var absence = getAbsence(employee, absenceId);
        OptimisticLocking.checkVersion("absence", absence.getVersion(), request.version());
        checkPeriod(employee, request, absenceId);
        absenceMapper.updateAbsence(request, absence);
        return absenceMapper.toAbsenceResponse(absenceRepository.saveAndFlush(absence));
    }

    public void delete(UUID employeeId, UUID absenceId) {
        final var employee = getEmployee(employeeId);
        employee.getAbsences().remove(getAbsence(employee, absenceId));
    }

    /** The end cannot be before the start, and an employee cannot be away twice on the same day. */
    private static void checkPeriod(Employee employee, AbsenceRequest request, UUID ignoredAbsenceId) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleViolationException("The end date cannot be before the start date");
        }
        employee.getAbsences().stream()
                .filter(other -> !other.getId().equals(ignoredAbsenceId))
                .filter(other -> other.overlaps(request.startDate(), request.endDate()))
                .findFirst()
                .ifPresent(other -> {
                    throw new BusinessRuleViolationException(
                            "This absence overlaps another one (%s to %s)".formatted(other.getStartDate(),
                                    other.getEndDate()));
                });
    }

    private Employee getEmployee(UUID id) {
        return employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("employee", id));
    }

    private static Absence getAbsence(Employee employee, UUID absenceId) {
        return employee.getAbsences().stream().filter(absence -> absence.getId().equals(absenceId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("The employee has no absence with the id " + absenceId));
    }

}
