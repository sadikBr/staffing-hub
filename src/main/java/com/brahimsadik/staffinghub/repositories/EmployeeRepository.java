package com.brahimsadik.staffinghub.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.brahimsadik.staffinghub.models.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {

    /** Everyone under the manager, at any depth (their staff, their staff's staff...), not the manager. */
    @Query(value = """
            WITH RECURSIVE team AS (
                SELECT "id" FROM "employees" WHERE "manager_id" = :managerId
                UNION
                SELECT e."id" FROM "employees" e JOIN team t ON e."manager_id" = t."id"
            )
            SELECT "id" FROM team""", nativeQuery = true)
    List<UUID> findTeamIds(UUID managerId);

}
