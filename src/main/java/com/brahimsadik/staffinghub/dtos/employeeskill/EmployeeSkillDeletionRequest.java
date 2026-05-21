package com.brahimsadik.staffinghub.dtos.employeeskill;

import lombok.Data;

import java.util.UUID;

@Data
public class EmployeeSkillDeletionRequest {

    private UUID employeeId;

    private UUID skillId;

}
