package com.brahimsadik.staffinghub.dtos.skill;

import java.util.UUID;

import lombok.Data;

@Data
public class SkillCreationUpdateRequest {

    private String label;

    private UUID technologyId;

}
