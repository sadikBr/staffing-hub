package com.brahimsadik.staffinghub.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.brahimsadik.staffinghub.models.Technology;

public interface TechnologyRepository extends CrudRepository<Technology, UUID> {

    @Override
    @EntityGraph(attributePaths = "skills")
    @Query("Select t From Technology t")
    List<Technology> findAll();

    @Override
    @EntityGraph(attributePaths = "skills")
    @Query("Select t From Technology t Where t.id = :id")
    Optional<Technology> findById(@Param("id") UUID id);

}
