package com.brahimsadik.staffinghub.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.MissionAssignment;

/** Assignments are written through {@link com.brahimsadik.staffinghub.models.Mission}; this is for queries. */
public interface MissionAssignmentRepository extends JpaRepository<MissionAssignment, UUID> {

    boolean existsByEmployeeId(UUID employeeId);

    List<MissionAssignment> findByEmployeeId(UUID employeeId);

    List<MissionAssignment> findByEndDateBetweenOrderByEndDateAsc(LocalDate from, LocalDate to);

}
