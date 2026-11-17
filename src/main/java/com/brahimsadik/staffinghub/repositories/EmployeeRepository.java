package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

}
