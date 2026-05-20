package com.brahimsadik.staffinghub.mappers;

import com.brahimsadik.staffinghub.dtos.employee.EmployeeCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.employee.EmployeeResponse;
import com.brahimsadik.staffinghub.models.Employee;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    EmployeeResponse toEmployeeResponse(Employee employee);

    Employee toEmployee(EmployeeCreationUpdateRequest request);

}
