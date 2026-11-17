package com.brahimsadik.staffinghub.services;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeRolesRequest;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeTechnologiesRequest;
import com.brahimsadik.staffinghub.dtos.employeeskill.SetEmployeeSkillLevelRequest;
import com.brahimsadik.staffinghub.exceptions.BusinessRuleViolationException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.EmployeeMapper;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.repositories.EmployeeRepository;
import com.brahimsadik.staffinghub.repositories.RoleRepository;
import com.brahimsadik.staffinghub.repositories.SkillRepository;
import com.brahimsadik.staffinghub.repositories.TechnologyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final TechnologyRepository technologyRepository;
    private final SkillRepository skillRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeResponse create(EmployeeCreationUpdateRequest request) {
        final var employee = employeeMapper.toEmployee(request);
        assignManager(employee, request.managerId());
        return employeeMapper.toEmployeeResponse(employeeRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> findAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(employeeMapper::toEmployeeResponse);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse findEmployeeById(UUID id) {
        return employeeMapper.toEmployeeResponse(getEmployee(id));
    }

    /** Full replacement: a missing or null {@code managerId} removes the employee's manager. */
    public EmployeeResponse updateEmployeeById(UUID id, EmployeeCreationUpdateRequest request) {
        final var employee = getEmployee(id);
        employeeMapper.updateEmployee(request, employee);
        assignManager(employee, request.managerId());
        return employeeMapper.toEmployeeResponse(employeeRepository.saveAndFlush(employee));
    }

    /** The employee's staff are kept: they no longer have a manager. */
    public void delete(UUID id) {
        final var employee = getEmployee(id);
        employee.getStaff().forEach(member -> member.setManager(null));
        employeeRepository.delete(employee);
    }

    public EmployeeResponse setEmployeeRoles(UUID id, SetEmployeeRolesRequest request) {
        final var employee = getEmployee(id);
        employee.setRoles(findAllOrFail("role", request.roleIds(), roleRepository::findAllById,
                role -> role.getId()));
        return employeeMapper.toEmployeeResponse(employee);
    }

    public EmployeeResponse setEmployeeTechnologies(UUID id, SetEmployeeTechnologiesRequest request) {
        final var employee = getEmployee(id);
        employee.setTechnologies(findAllOrFail("technology", request.technologyIds(),
                technologyRepository::findAllById, technology -> technology.getId()));
        employee.removeSkillsOutsideTechnologies();
        return employeeMapper.toEmployeeResponse(employee);
    }

    /** Adds the skill to the employee, or changes their level if they already have it. */
    public EmployeeResponse setEmployeeSkillLevel(UUID employeeId, UUID skillId,
            SetEmployeeSkillLevelRequest request) {
        final var employee = getEmployee(employeeId);
        final var skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("skill", skillId));

        if (!employee.hasTechnology(skill.getTechnology().getId())) {
            throw new BusinessRuleViolationException(
                    "The employee must have the technology '%s' before they can have the skill '%s'"
                            .formatted(skill.getTechnology().getLabel(), skill.getLabel()));
        }

        employee.setSkillLevel(skill, request.level());
        return employeeMapper.toEmployeeResponse(employeeRepository.saveAndFlush(employee));
    }

    public void removeEmployeeSkill(UUID employeeId, UUID skillId) {
        final var employee = getEmployee(employeeId);
        if (!employee.removeSkill(skillId)) {
            throw new ResourceNotFoundException("The employee does not have the skill " + skillId);
        }
    }

    private Employee getEmployee(UUID id) {
        return employeeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("employee", id));
    }

    private void assignManager(Employee employee, UUID managerId) {
        if (managerId == null) {
            employee.setManager(null);
            return;
        }

        if (managerId.equals(employee.getId())) {
            throw new BusinessRuleViolationException("An employee cannot be their own manager");
        }

        final var manager = employeeRepository.findById(managerId).orElseThrow(
                () -> new BusinessRuleViolationException("No manager exists with the id " + managerId));

        // A new employee (no id yet) cannot appear in anyone's management chain.
        if (employee.getId() != null && manager.isManagedBy(employee)) {
            throw new BusinessRuleViolationException(
                    "This would create a management cycle: the chosen manager reports, directly or indirectly, to this employee");
        }

        employee.setManager(manager);
    }

    /** Loads every entity for the given ids, failing with the list of unknown ids if any is missing. */
    private static <T> Set<T> findAllOrFail(String resource, Collection<UUID> ids,
            Function<Collection<UUID>, List<T>> finder, Function<T, UUID> idOf) {
        final var found = new HashSet<>(finder.apply(ids));
        if (found.size() != ids.size()) {
            final var foundIds = found.stream().map(idOf).collect(Collectors.toSet());
            final var missing = ids.stream().filter(id -> !foundIds.contains(id)).map(UUID::toString).sorted()
                    .collect(Collectors.joining(", "));
            throw new BusinessRuleViolationException("No %s exists with the id(s) %s".formatted(resource, missing));
        }
        return found;
    }

}
