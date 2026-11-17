package com.brahimsadik.staffinghub.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.brahimsadik.staffinghub.models.Mission;

public interface MissionRepository extends JpaRepository<Mission, UUID>, JpaSpecificationExecutor<Mission> {

    boolean existsByCustomerId(UUID customerId);

    /** Rows of [status, count]. */
    @Query("SELECT m.status, COUNT(m) FROM Mission m GROUP BY m.status")
    List<Object[]> countByStatus();

}
