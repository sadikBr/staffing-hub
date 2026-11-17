package com.brahimsadik.staffinghub.repositories;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.brahimsadik.staffinghub.enums.MissionStatus;
import com.brahimsadik.staffinghub.models.MissionNeed;

/** Needs are written through {@link com.brahimsadik.staffinghub.models.Mission}; this is for queries. */
public interface MissionNeedRepository extends JpaRepository<MissionNeed, UUID> {

    /** Open needs of missions in the given statuses, soonest first (undated last). */
    @Query("""
            SELECT n FROM MissionNeed n JOIN FETCH n.mission m
            WHERE n.filledBy IS NULL AND m.status IN :statuses
            ORDER BY n.startDate ASC NULLS LAST, n.createdAt ASC""")
    List<MissionNeed> findOpenNeeds(Collection<MissionStatus> statuses);

}
