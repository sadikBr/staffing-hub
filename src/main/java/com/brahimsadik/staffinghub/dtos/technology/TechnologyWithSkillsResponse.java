package com.brahimsadik.staffinghub.dtos.technology;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class TechnologyWithSkillsResponse {

    private UUID id;

    private String label;

    private Set<SkillResponse> skills;

}
