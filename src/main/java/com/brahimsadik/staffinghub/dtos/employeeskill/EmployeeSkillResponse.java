package com.brahimsadik.staffinghub.dtos.employeeskill;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.enums.SkillLevel;
import lombok.Data;

@Data
public class EmployeeSkillResponse {

    private SkillResponse skill;

    private SkillLevel level;

}
