package com.brahimsadik.staffinghub.dtos.employee;

import java.util.Optional;
import java.util.UUID;

import com.brahimsadik.staffinghub.enums.Community;
import com.brahimsadik.staffinghub.enums.Seniority;

import lombok.Data;

@Data
public class EmployeeCreationUpdateRequest {

    private String firstName;

    private String lastName;

    private String comment;

    private Seniority seniority;

    private Community community;

    private Optional<UUID> managerId;

}
