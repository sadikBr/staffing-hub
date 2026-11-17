package com.brahimsadik.staffinghub.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.Absence;

public interface AbsenceRepository extends JpaRepository<Absence, UUID> {

    List<Absence> findByEmployeeIdOrderByStartDateDesc(UUID employeeId);

}
