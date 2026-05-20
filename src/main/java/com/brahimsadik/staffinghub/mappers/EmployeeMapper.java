package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.Mapper;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.models.Employee;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    EmployeeResponse toEmployeeResponse(Employee employee);

    Employee toEmployee(EmployeeCreationUpdateRequest request);

}
