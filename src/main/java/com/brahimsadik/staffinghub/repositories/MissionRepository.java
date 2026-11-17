package com.brahimsadik.staffinghub.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.brahimsadik.staffinghub.models.Mission;

public interface MissionRepository extends JpaRepository<Mission, UUID>, JpaSpecificationExecutor<Mission> {

    boolean existsByCustomerId(UUID customerId);

}
