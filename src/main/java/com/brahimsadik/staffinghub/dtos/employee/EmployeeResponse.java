package com.brahimsadik.staffinghub.dtos.employee;

import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillResponse;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class EmployeeResponse {

    private UUID id;

    private String firstName;

    private String lastName;

    private String comment;

    private Seniority seniority;

    private Community community;

    private Set<EmployeeResponse> staff;

    private Set<RoleResponse> roles;

    private Set<TechnologyResponse> technologies;

    private Set<EmployeeSkillResponse> skills;

}
