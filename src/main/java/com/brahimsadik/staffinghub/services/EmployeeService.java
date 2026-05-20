package com.brahimsadik.staffinghub.services;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeRolesRequest;
import com.brahimsadik.staffinghub.dtos.employee.SetEmployeeTechnologiesRequest;
import com.brahimsadik.staffinghub.mappers.EmployeeMapper;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.models.Role;
import com.brahimsadik.staffinghub.models.Technology;
import com.brahimsadik.staffinghub.repositories.EmployeeRepository;
import com.brahimsadik.staffinghub.repositories.RoleRepository;
import com.brahimsadik.staffinghub.repositories.TechnologyRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@AllArgsConstructor
public class EmployeeService {

    private final RoleRepository roleRepository;
    private final TechnologyRepository technologyRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeResponse create(EmployeeCreationUpdateRequest request) {
        final var employee = employeeMapper.toEmployee(request);
        Employee persistedEmployee;

        if (request.getManagerId().isEmpty()) {
            persistedEmployee = employeeRepository.save(employee);
            return employeeMapper.toEmployeeResponse(persistedEmployee);
        }

        var managerId = request.getManagerId().get();

        var manager = employeeRepository.findById(managerId).orElse(null);
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

        var managerId = request.getManagerId().get();

        var manager = employeeRepository.findById(managerId).orElse(null);
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
        var employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        var newRoles = (Set<Role>) roleRepository.findAllById(request.getRolesIds());

        if (newRoles.size() != request.getRolesIds().size()) {
            throw new RuntimeException("One or more provided role IDs are invalid.");
        }

        employee.setRoles(newRoles);
        var persistedEmployee = employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(persistedEmployee);
    }

    public EmployeeResponse setEmployeeTechnologies(UUID id, SetEmployeeTechnologiesRequest request) {
        var employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new RuntimeException("No employee exists with the id: " + id);
        }

        var newTechnologies = (Set<Technology>) technologyRepository.findAllById(request.getTechnologiesIds());

        if (newTechnologies.size() != request.getTechnologiesIds().size()) {
            throw new RuntimeException("One ore more provided technology IDs are invalid.");
        }

        employee.setTechnologies(newTechnologies);
        var persistedEmployee = employeeRepository.save(employee);
        return employeeMapper.toEmployeeResponse(employee);
    }

}
