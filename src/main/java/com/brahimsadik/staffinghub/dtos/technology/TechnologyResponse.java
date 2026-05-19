package com.brahimsadik.staffinghub.dtos.technology;

import java.util.Set;
import java.util.UUID;

import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;

import lombok.Data;

@Data
public class TechnologyResponse {

    private UUID id;

    private String label;

    private Set<SkillResponse> skills;

}
