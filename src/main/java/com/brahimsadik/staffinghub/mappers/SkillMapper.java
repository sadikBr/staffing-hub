package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.Mapper;

import com.brahimsadik.staffinghub.dtos.skill.SkillCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.models.Skill;

@Mapper(componentModel = "spring")
public interface SkillMapper {

    SkillResponse toSkillResponse(Skill skill);

    Skill toSkill(SkillCreationUpdateRequest request);

}
