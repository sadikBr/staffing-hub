package com.brahimsadik.staffinghub.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.brahimsadik.staffinghub.models.Employee;

public interface EmployeeRepository extends CrudRepository<Employee, UUID> {

    @Override
    @EntityGraph(attributePaths = "staff")
    @Query("Select e From Employee e")
    List<Employee> findAll();

    @Override
    @EntityGraph(attributePaths = "staff")
    @Query("Select e From Employee e Where e.id = :id")
    Optional<Employee> findById(@Param("id") UUID id);

}
