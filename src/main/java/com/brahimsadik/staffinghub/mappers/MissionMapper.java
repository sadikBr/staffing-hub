package com.brahimsadik.staffinghub.mappers;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.domain.OccupationCalculator;
import com.brahimsadik.staffinghub.dtos.mission.AssignmentOccupation;
import com.brahimsadik.staffinghub.dtos.mission.EmployeeAssignmentResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionAssignmentRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionAssignmentResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionSkillResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionSummary;
import com.brahimsadik.staffinghub.dtos.mission.RequiredSkillMatch;
import com.brahimsadik.staffinghub.models.EmployeeSkill;
import com.brahimsadik.staffinghub.models.Mission;
import com.brahimsadik.staffinghub.models.MissionAssignment;
import com.brahimsadik.staffinghub.models.MissionSkill;

@Mapper(config = CentralMapperConfig.class, uses = { CustomerMapper.class, EmployeeMapper.class, SkillMapper.class })
public interface MissionMapper {

    @Mapping(target = "requiredSkills", source = "skills")
    MissionResponse toMissionResponse(Mission mission);

    MissionSummary toMissionSummary(Mission mission);

    MissionSkillResponse toMissionSkillResponse(MissionSkill missionSkill);

    @Mapping(target = "skillMatches", expression = "java(toSkillMatches(assignment))")
    @Mapping(target = "employeeOccupation", expression = "java(toEmployeeOccupation(assignment))")
    MissionAssignmentResponse toMissionAssignmentResponse(MissionAssignment assignment);

    @Mapping(target = "skillMatches", expression = "java(toSkillMatches(assignment))")
    @Mapping(target = "employeeOccupation", expression = "java(toEmployeeOccupation(assignment))")
    EmployeeAssignmentResponse toEmployeeAssignmentResponse(MissionAssignment assignment);

    /** The customer and project manager are resolved and validated by the service. */
    @Mapping(target = "version", ignore = true)
    Mission toMission(MissionCreationUpdateRequest request);

    @Mapping(target = "version", ignore = true)
    void updateMission(MissionCreationUpdateRequest request, @MappingTarget Mission mission);

    /** The employee is resolved and validated by the service. */
    @Mapping(target = "version", ignore = true)
    MissionAssignment toMissionAssignment(MissionAssignmentRequest request);

    @Mapping(target = "version", ignore = true)
    void updateMissionAssignment(MissionAssignmentRequest request, @MappingTarget MissionAssignment assignment);

    default List<MissionSkillResponse> toSortedMissionSkillResponses(Collection<MissionSkill> skills) {
        return skills.stream().map(this::toMissionSkillResponse)
                .sorted(Comparator.comparing(skill -> skill.skill().label())).toList();
    }

    /** Sorted by start date (undated last), then by employee name. */
    default List<MissionAssignmentResponse> toSortedMissionAssignmentResponses(
            Collection<MissionAssignment> assignments) {
        return assignments.stream().sorted(Comparator
                .comparing(MissionAssignment::getStartDate, Comparator.nullsLast(Comparator.<LocalDate>naturalOrder()))
                .thenComparing(assignment -> assignment.getEmployee().getLastName())
                .thenComparing(assignment -> assignment.getEmployee().getFirstName()))
                .map(this::toMissionAssignmentResponse).toList();
    }

    default AssignmentOccupation toEmployeeOccupation(MissionAssignment assignment) {
        if (assignment.getStartDate() == null) {
            return null;
        }
        final var peak = OccupationCalculator.peakRate(assignment.getEmployee().getAssignments(),
                assignment.getStartDate(), assignment.getEndDate());
        return new AssignmentOccupation(peak, peak.compareTo(OccupationCalculator.FULL_TIME) > 0);
    }

    /** Compares the assigned employee's skill levels with each of the mission's required skills. */
    default List<RequiredSkillMatch> toSkillMatches(MissionAssignment assignment) {
        final var employeeLevels = assignment.getEmployee().getSkills().stream()
                .collect(Collectors.toMap(skill -> skill.getSkill().getId(),
                        Function.<EmployeeSkill>identity()));

        return toSortedMissionSkillResponses(assignment.getMission().getSkills()).stream().map(required -> {
            final var employeeSkill = employeeLevels.get(required.skill().id());
            final var employeeLevel = employeeSkill == null ? null : employeeSkill.getLevel();
            final var meetsRequirement = employeeLevel != null
                    && (required.requiredLevel() == null || employeeLevel.isAtLeast(required.requiredLevel()));
            return new RequiredSkillMatch(required.skill(), required.requiredLevel(), employeeLevel,
                    meetsRequirement);
        }).toList();
    }

}
