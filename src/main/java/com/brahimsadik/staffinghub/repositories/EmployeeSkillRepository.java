package com.brahimsadik.staffinghub.repositories;

import com.brahimsadik.staffinghub.models.EmployeeSkill;
import org.springframework.data.repository.CrudRepository;

public interface EmployeeSkillRepository extends CrudRepository<EmployeeSkill, EmployeeSkill.EmployeeSkillId> {
}
