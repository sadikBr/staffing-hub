package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.brahimsadik.staffinghub.models.Role;

public interface RoleRepository extends CrudRepository<Role, UUID> {

}
