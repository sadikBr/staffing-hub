package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.domain.WorkingDays;
import com.brahimsadik.staffinghub.dtos.absence.AbsenceRequest;
import com.brahimsadik.staffinghub.dtos.absence.AbsenceResponse;
import com.brahimsadik.staffinghub.dtos.absence.AbsenceSummary;
import com.brahimsadik.staffinghub.models.Absence;

@Mapper(config = CentralMapperConfig.class, imports = WorkingDays.class)
public interface AbsenceMapper {

    @Mapping(target = "workingDays", expression = "java(WorkingDays.between(absence.getStartDate(), absence.getEndDate()))")
    AbsenceResponse toAbsenceResponse(Absence absence);

    AbsenceSummary toAbsenceSummary(Absence absence);

    /** The employee is set by the service. */
    @Mapping(target = "version", ignore = true)
    Absence toAbsence(AbsenceRequest request);

    @Mapping(target = "version", ignore = true)
    void updateAbsence(AbsenceRequest request, @MappingTarget Absence absence);

}
