package com.brahimsadik.staffinghub.controllers;

import java.util.List;
import java.util.UUID;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.brahimsadik.staffinghub.dtos.mission.AssignmentPeriodRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionAssignmentRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionAssignmentResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionResponse;
import com.brahimsadik.staffinghub.dtos.mission.SetMissionSkillRequest;
import com.brahimsadik.staffinghub.dtos.need.FillNeedRequest;
import com.brahimsadik.staffinghub.dtos.need.MissionNeedRequest;
import com.brahimsadik.staffinghub.dtos.need.NeedCandidateResponse;
import com.brahimsadik.staffinghub.enums.BusinessUnit;
import com.brahimsadik.staffinghub.enums.MissionStatus;
import com.brahimsadik.staffinghub.services.MissionService;
import com.brahimsadik.staffinghub.services.StaffingNeedService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@Tag(name = "Missions", description = "Missions for customers, the skills they require, and the employees assigned to them.")
@RequiredArgsConstructor
@RequestMapping("/missions")
public class MissionController {

    private final MissionService missionService;
    private final StaffingNeedService staffingNeedService;

    @PostMapping
    @Operation(summary = "Create a mission")
    public ResponseEntity<MissionResponse> create(@Validated @RequestBody MissionCreationUpdateRequest request,
            UriComponentsBuilder uriBuilder) {
        final var response = missionService.create(request);
        final var location = uriBuilder.path("/api/missions/{id}").buildAndExpand(response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "List missions (paginated), optionally filtered by text, customer, status and business unit")
    public PagedModel<MissionResponse> findAllMissions(
            @Parameter(description = "Part of the label, project name or customer name, case-insensitive")
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) MissionStatus status,
            @RequestParam(required = false) BusinessUnit businessUnit,
            @ParameterObject @SortDefault(sort = "label") Pageable pageable) {
        return new PagedModel<>(missionService.findAllMissions(search, customerId, status, businessUnit, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a mission with its required skills and assignments")
    public MissionResponse findMissionById(@PathVariable UUID id) {
        return missionService.findMissionById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace a mission's details")
    public MissionResponse updateMissionById(@PathVariable UUID id,
            @Validated @RequestBody MissionCreationUpdateRequest request) {
        return missionService.updateMissionById(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a mission (and its required skills and assignments)")
    public void delete(@PathVariable UUID id) {
        missionService.delete(id);
    }

    @PutMapping("/{id}/skills/{skillId}")
    @Operation(summary = "Require a skill for a mission, or change its required level (optional)")
    public MissionResponse setMissionSkill(@PathVariable UUID id, @PathVariable UUID skillId,
            @RequestBody(required = false) SetMissionSkillRequest request) {
        return missionService.setMissionSkill(id, skillId, request);
    }

    @DeleteMapping("/{id}/skills/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a required skill from a mission")
    public void removeMissionSkill(@PathVariable UUID id, @PathVariable UUID skillId) {
        missionService.removeMissionSkill(id, skillId);
    }

    @PostMapping("/{id}/assignments")
    @Operation(summary = "Assign an employee to a mission (allowed even if their skill levels fall short)")
    public ResponseEntity<MissionAssignmentResponse> createAssignment(@PathVariable UUID id,
            @Validated @RequestBody MissionAssignmentRequest request, UriComponentsBuilder uriBuilder) {
        final var response = missionService.createAssignment(id, request);
        final var location = uriBuilder.path("/api/missions/{id}/assignments/{assignmentId}")
                .buildAndExpand(id, response.id()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}/assignments/{assignmentId}")
    @Operation(summary = "Get one of a mission's assignments")
    public MissionAssignmentResponse findAssignment(@PathVariable UUID id, @PathVariable UUID assignmentId) {
        return missionService.findAssignment(id, assignmentId);
    }

    @PutMapping("/{id}/assignments/{assignmentId}")
    @Operation(summary = "Replace an assignment's details")
    public MissionAssignmentResponse updateAssignment(@PathVariable UUID id, @PathVariable UUID assignmentId,
            @Validated @RequestBody MissionAssignmentRequest request) {
        return missionService.updateAssignment(id, assignmentId, request);
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove an assignment from a mission (the need it filled, if any, opens again)")
    public void deleteAssignment(@PathVariable UUID id, @PathVariable UUID assignmentId) {
        missionService.deleteAssignment(id, assignmentId);
    }

    @PatchMapping("/{id}/assignments/{assignmentId}/period")
    @Operation(summary = "Move an assignment in time, without changing anything else (days worked are capped to the new period)")
    public MissionAssignmentResponse moveAssignment(@PathVariable UUID id, @PathVariable UUID assignmentId,
            @Validated @RequestBody AssignmentPeriodRequest request) {
        return missionService.moveAssignment(id, assignmentId, request);
    }

    @PostMapping("/{id}/needs")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add an open position (need) to a mission; returns the whole mission")
    public MissionResponse createNeed(@PathVariable UUID id, @Validated @RequestBody MissionNeedRequest request) {
        return missionService.createNeed(id, request);
    }

    @PutMapping("/{id}/needs/{needId}")
    @Operation(summary = "Replace a need's details; returns the whole mission")
    public MissionResponse updateNeed(@PathVariable UUID id, @PathVariable UUID needId,
            @Validated @RequestBody MissionNeedRequest request) {
        return missionService.updateNeed(id, needId, request);
    }

    @DeleteMapping("/{id}/needs/{needId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a need (the assignment that filled it, if any, is kept)")
    public void deleteNeed(@PathVariable UUID id, @PathVariable UUID needId) {
        missionService.deleteNeed(id, needId);
    }

    @GetMapping("/{id}/needs/{needId}/candidates")
    @Operation(summary = "Rank the employees who could fill a need, best first",
            description = """
                    Score out of 100: how well the employee fits (the mission's required skills 55%, seniority 25%, \
                    role 20%), multiplied by the share of the wanted time they are free over the need's period. A \
                    criterion the need does not specify counts as met.""")
    public List<NeedCandidateResponse> findNeedCandidates(@PathVariable UUID id, @PathVariable UUID needId,
            @Parameter(description = "How many candidates to return (1 to 50)") @RequestParam(defaultValue = "10") int limit) {
        return staffingNeedService.findCandidates(id, needId, limit);
    }

    @PostMapping("/{id}/needs/{needId}/fill")
    @Operation(summary = "Fill a need: assigns the employee with the need's dates and rate; returns the whole mission")
    public MissionResponse fillNeed(@PathVariable UUID id, @PathVariable UUID needId,
            @Validated @RequestBody FillNeedRequest request) {
        return missionService.fillNeed(id, needId, request);
    }

}
