package com.brahimsadik.staffinghub.services;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeRolesRequest;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeTechnologiesRequest;
import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillCreationRequest;
import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillDeletionRequest;
import com.brahimsadik.staffinghub.mappers.EmployeeMapper;
import com.brahimsadik.staffinghub.mappers.EmployeeSkillMapper;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.models.Role;
import com.brahimsadik.staffinghub.models.Technology;
import com.brahimsadik.staffinghub.repositories.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class EmployeeService {

    private final RoleRepository roleRepository;
    private final TechnologyRepository technologyRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final EmployeeSkillMapper employeeSkillMapper;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public EmployeeResponse create(EmployeeCreationUpdateRequest request) {
        final var employee = employeeMapper.toEmployee(request);
        Employee persistedEmployee;

        if (request.getManagerId().isEmpty()) {
            persistedEmployee = employeeRepository.save(employee);
            return employeeMapper.toEmployeeResponse(persistedEmployee);
        }

        final var managerId = request.getManagerId().get();

        final var manager = employeeRepository.findById(managerId).orElse(null);
        if (manager == null) {
            throw new RuntimeException(String.format("No manager exists with the id: " + managerId));
        }

        employee.setManager(manager);

        persistedEmployee = employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(persistedEmployee);
    }

    public List<EmployeeResponse> findAllEmployees() {
        final var allEmployees = employeeRepository.findAll();
        return allEmployees.stream().map(employeeMapper::toEmployeeResponse).toList();
    }

    public EmployeeResponse findEmployeeById(UUID id) {
        final var employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        return employeeMapper.toEmployeeResponse(employee);
    }

    public EmployeeResponse updateEmployeeById(UUID id, EmployeeCreationUpdateRequest request) {
        final var employee = employeeRepository.findById(id).orElse(null);
        Employee persistedEmployee;
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setComment(request.getComment());
        employee.setSeniority(request.getSeniority());
        employee.setCommunity(request.getCommunity());

        if (request.getManagerId().isEmpty()) {
            persistedEmployee = employeeRepository.save(employee);
            return employeeMapper.toEmployeeResponse(persistedEmployee);
        }

        final var managerId = request.getManagerId().get();

        final var manager = employeeRepository.findById(managerId).orElse(null);
        if (manager == null) {
            throw new RuntimeException(String.format("No manager exists with the id: " + managerId));
        }

        employee.setManager(manager);
        persistedEmployee = employeeRepository.save(employee);

        return employeeMapper.toEmployeeResponse(persistedEmployee);
    }

    public void delete(UUID id) {
        final var employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        employeeRepository.delete(employee);
    }

    public EmployeeResponse setEmployeeRoles(UUID id, SetEmployeeRolesRequest request) {
        final var employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        final var newRoles = new HashSet<>((List<Role>) roleRepository.findAllById(request.getRolesIds()));

        if (newRoles.size() != request.getRolesIds().size()) {
            throw new RuntimeException("One or more provided role IDs are invalid.");
        }

        employee.setRoles(newRoles);
        final var persistedEmployee = employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(persistedEmployee);
    }

    public EmployeeResponse setEmployeeTechnologies(UUID id, SetEmployeeTechnologiesRequest request) {
        final var employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        final var newTechnologies = new HashSet<>((List<Technology>) technologyRepository.findAllById(request.getTechnologiesIds()));

        if (newTechnologies.size() != request.getTechnologiesIds().size()) {
            throw new RuntimeException("One ore more provided technology IDs are invalid.");
        }

        employee.setTechnologies(newTechnologies);
        final var persistedEmployee = employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(persistedEmployee);
    }

    public EmployeeResponse addSkillToEmployee(EmployeeSkillCreationRequest request) {
        final var employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + request.getEmployeeId());
        }

        final var skill = skillRepository.findByIdWithTechnology(request.getSkillId()).orElse(null);
        if (skill == null) {
            throw new RuntimeException("No skill exists with the id: " + request.getSkillId());
        }

        var technology = skill.getTechnology();
        if (!employee.hasTechnology(technology.getId())) {
            throw new RuntimeException("The employee has no expertise in this technology.");
        }

        var employeeSkill = employeeSkillMapper.toEmployeeSkill(request);

        employeeSkill.setId(employeeSkillMapper.toId(request));
        employeeSkill.setEmployee(employee);
        employeeSkill.setSkill(skill);

        employeeSkillRepository.save(employeeSkill);

        return employeeMapper.toEmployeeResponse(employee);
    }

    public EmployeeResponse removeSkillFromEmployee(EmployeeSkillDeletionRequest request) {
        var employeeSkill = employeeSkillRepository.findById(employeeSkillMapper.toId(request)).orElse(null);
        if (employeeSkill == null) {
            throw new RuntimeException("No employee skill found for the give IDs");
        }

        var employee = employeeSkill.getEmployee();
        employeeSkillRepository.delete(employeeSkill);

        return employeeMapper.toEmployeeResponse(employee);
    }

}
