package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.Skill;

public interface SkillRepository extends JpaRepository<Skill, UUID> {

    boolean existsByTechnologyIdAndLabel(UUID technologyId, String label);

    boolean existsByTechnologyIdAndLabelAndIdNot(UUID technologyId, String label, UUID id);

}
