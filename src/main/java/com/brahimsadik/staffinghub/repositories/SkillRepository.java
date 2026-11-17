package com.brahimsadik.staffinghub.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.Skill;

public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findByTechnologyId(UUID technologyId, Sort sort);

    boolean existsByTechnologyIdAndLabel(UUID technologyId, String label);

    boolean existsByTechnologyIdAndLabelAndIdNot(UUID technologyId, String label, UUID id);

}
