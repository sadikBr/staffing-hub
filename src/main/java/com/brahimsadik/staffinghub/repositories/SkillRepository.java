package com.brahimsadik.staffinghub.repositories;

import com.brahimsadik.staffinghub.models.Skill;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SkillRepository extends CrudRepository<Skill, UUID> {

    @Query("SELECT s FROM Skill s JOIN FETCH s.technology WHERE s.id = :id")
    Optional<Skill> findByIdWithTechnology(@Param("id") UUID id);

}
