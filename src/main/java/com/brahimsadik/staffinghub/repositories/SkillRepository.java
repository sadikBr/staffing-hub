package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.brahimsadik.staffinghub.models.Skill;

public interface SkillRepository extends CrudRepository<Skill, UUID> {

}
