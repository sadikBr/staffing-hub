package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.EmployeeSkill;

/** Employee skills are written through {@link com.brahimsadik.staffinghub.models.Employee}; this is for queries. */
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, EmployeeSkill.EmployeeSkillId> {

    boolean existsBySkillId(UUID skillId);

}
