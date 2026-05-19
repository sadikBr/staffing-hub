package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.brahimsadik.staffinghub.models.Technology;

public interface TechnologyRepository extends CrudRepository<Technology, UUID> {

}
