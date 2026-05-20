package com.brahimsadik.staffinghub.dtos.employee;

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

}
