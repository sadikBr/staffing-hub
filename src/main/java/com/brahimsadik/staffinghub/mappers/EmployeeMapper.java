package com.brahimsadik.staffinghub.mappers;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeSummary;
import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillResponse;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.models.EmployeeSkill;

@Mapper(config = CentralMapperConfig.class, uses = { RoleMapper.class, TechnologyMapper.class, SkillMapper.class })
public interface EmployeeMapper {

    EmployeeResponse toEmployeeResponse(Employee employee);

    EmployeeSummary toEmployeeSummary(Employee employee);

    EmployeeSkillResponse toEmployeeSkillResponse(EmployeeSkill employeeSkill);

    /** The manager is resolved and validated by the service. */
    @Mapping(target = "version", ignore = true)
    Employee toEmployee(EmployeeCreationUpdateRequest request);

    @Mapping(target = "version", ignore = true)
    void updateEmployee(EmployeeCreationUpdateRequest request, @MappingTarget Employee employee);

    default List<EmployeeSummary> toSortedEmployeeSummaries(Collection<Employee> employees) {
        return employees.stream().map(this::toEmployeeSummary)
                .sorted(Comparator.comparing(EmployeeSummary::lastName).thenComparing(EmployeeSummary::firstName))
                .toList();
    }

    default List<EmployeeSkillResponse> toSortedEmployeeSkillResponses(Collection<EmployeeSkill> skills) {
        return skills.stream().map(this::toEmployeeSkillResponse)
                .sorted(Comparator.comparing(skill -> skill.skill().label())).toList();
    }

}
