package com.brahimsadik.staffinghub.mappers;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.dtos.skill.SkillCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.models.Skill;

@Mapper(config = CentralMapperConfig.class)
public interface SkillMapper {

    @Mapping(target = "technologyId", source = "technology.id")
    SkillResponse toSkillResponse(Skill skill);

    /** The technology is resolved and set by the service. */
    @Mapping(target = "version", ignore = true)
    Skill toSkill(SkillCreationUpdateRequest request);

    @Mapping(target = "version", ignore = true)
    void updateSkill(SkillCreationUpdateRequest request, @MappingTarget Skill skill);

    default List<SkillResponse> toSortedSkillResponses(Collection<Skill> skills) {
        return skills.stream().map(this::toSkillResponse).sorted(Comparator.comparing(SkillResponse::label)).toList();
    }

}
