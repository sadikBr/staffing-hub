package com.brahimsadik.staffinghub.mappers;

import com.brahimsadik.staffinghub.dtos.technology.TechnologyWithSkillsResponse;
import org.mapstruct.Mapper;

import com.brahimsadik.staffinghub.dtos.technology.TechnologyCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.models.Technology;

@Mapper(componentModel = "spring")
public interface TechnologyMapper {

    TechnologyResponse toTechnologyResponse(Technology technology);

    TechnologyWithSkillsResponse toTechnologyWithSkillsResponse(Technology technology);

    Technology toTechnology(TechnologyCreationUpdateRequest request);

}
