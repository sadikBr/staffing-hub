package com.brahimsadik.staffinghub.mappers;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.dtos.technology.TechnologyCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyWithSkillsResponse;
import com.brahimsadik.staffinghub.models.Technology;

@Mapper(config = CentralMapperConfig.class, uses = SkillMapper.class)
public interface TechnologyMapper {

    TechnologyResponse toTechnologyResponse(Technology technology);

    TechnologyWithSkillsResponse toTechnologyWithSkillsResponse(Technology technology);

    Technology toTechnology(TechnologyCreationUpdateRequest request);

    void updateTechnology(TechnologyCreationUpdateRequest request, @MappingTarget Technology technology);

    default List<TechnologyResponse> toSortedTechnologyResponses(Collection<Technology> technologies) {
        return technologies.stream().map(this::toTechnologyResponse)
                .sorted(Comparator.comparing(TechnologyResponse::label)).toList();
    }

}
