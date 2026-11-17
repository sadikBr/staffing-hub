package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brahimsadik.staffinghub.models.Technology;

public interface TechnologyRepository extends JpaRepository<Technology, UUID> {

    boolean existsByLabel(String label);

    boolean existsByLabelAndIdNot(String label, UUID id);

}
