package com.brahimsadik.staffinghub.mappers;

import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillCreationRequest;
import com.brahimsadik.staffinghub.dtos.employeeskill.EmployeeSkillDeletionRequest;
import com.brahimsadik.staffinghub.models.EmployeeSkill;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EmployeeSkillMapper {

    EmployeeSkill toEmployeeSkill(EmployeeSkillCreationRequest request);

    EmployeeSkill.EmployeeSkillId toId(EmployeeSkillCreationRequest request);

    EmployeeSkill.EmployeeSkillId toId(EmployeeSkillDeletionRequest request);

}
