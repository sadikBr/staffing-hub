package com.brahimsadik.staffinghub.dtos.employeeskill;

import com.brahimsadik.staffinghub.enums.SkillLevel;
import lombok.Data;

import java.util.UUID;

@Data
public class EmployeeSkillCreationRequest {

    private UUID employeeId;

    private UUID skillId;

    private SkillLevel level;

}
