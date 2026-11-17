package com.brahimsadik.staffinghub.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.mission.AssignmentPeriodRequest;
import com.brahimsadik.staffinghub.dtos.mission.EmployeeAssignmentResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionAssignmentRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionAssignmentResponse;
import com.brahimsadik.staffinghub.dtos.mission.MissionCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.mission.MissionResponse;
import com.brahimsadik.staffinghub.dtos.mission.SetMissionSkillRequest;
import com.brahimsadik.staffinghub.dtos.need.FillNeedRequest;
import com.brahimsadik.staffinghub.dtos.need.MissionNeedRequest;
import com.brahimsadik.staffinghub.enums.BusinessUnit;
import com.brahimsadik.staffinghub.enums.MissionStatus;
import com.brahimsadik.staffinghub.exceptions.BusinessRuleViolationException;
import com.brahimsadik.staffinghub.exceptions.ConflictException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.MissionMapper;
import com.brahimsadik.staffinghub.models.Employee;
import com.brahimsadik.staffinghub.models.Mission;
import com.brahimsadik.staffinghub.models.MissionAssignment;
import com.brahimsadik.staffinghub.models.MissionNeed;
import com.brahimsadik.staffinghub.models.Role;
import com.brahimsadik.staffinghub.repositories.CustomerRepository;
import com.brahimsadik.staffinghub.repositories.EmployeeRepository;
import com.brahimsadik.staffinghub.repositories.MissionAssignmentRepository;
import com.brahimsadik.staffinghub.repositories.MissionNeedRepository;
import com.brahimsadik.staffinghub.repositories.MissionRepository;
import com.brahimsadik.staffinghub.repositories.RoleRepository;
import com.brahimsadik.staffinghub.repositories.SkillRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MissionService {

    private final MissionRepository missionRepository;
    private final MissionAssignmentRepository missionAssignmentRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final RoleRepository roleRepository;
    private final MissionNeedRepository missionNeedRepository;
    private final MissionMapper missionMapper;

    // --- Missions ---------------------------------------------------------------------------------------------

    public MissionResponse create(MissionCreationUpdateRequest request) {
        final var mission = missionMapper.toMission(request);
        assignCustomerAndProjectManager(mission, request);
        return missionMapper.toMissionResponse(missionRepository.save(mission));
    }

    /** Every filter is optional; the ones given are combined with AND. */
    @Transactional(readOnly = true)
    public Page<MissionResponse> findAllMissions(String search, UUID customerId, MissionStatus status,
            BusinessUnit businessUnit, Pageable pageable) {
        final Specification<Mission> filters = (root, query, cb) -> {
            final var predicates = new ArrayList<Predicate>();
            if (search != null && !search.isBlank()) {
                final var pattern = "%" + search.trim().toLowerCase(Locale.ROOT).replace("\\", "\\\\")
                        .replace("%", "\\%").replace("_", "\\_") + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("label")), pattern, '\\'),
                        cb.like(cb.lower(root.get("projectName")), pattern, '\\'),
                        cb.like(cb.lower(root.get("customer").get("label")), pattern, '\\')));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (businessUnit != null) {
                predicates.add(cb.equal(root.get("businessUnit"), businessUnit));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return missionRepository.findAll(filters, pageable).map(missionMapper::toMissionResponse);
    }

    @Transactional(readOnly = true)
    public MissionResponse findMissionById(UUID id) {
        return missionMapper.toMissionResponse(getMission(id));
    }

    public MissionResponse updateMissionById(UUID id, MissionCreationUpdateRequest request) {
        final var mission = getMission(id);
        OptimisticLocking.checkVersion("mission", mission.getVersion(), request.version());
        missionMapper.updateMission(request, mission);
        assignCustomerAndProjectManager(mission, request);
        return missionMapper.toMissionResponse(missionRepository.saveAndFlush(mission));
    }

    /** Also deletes the mission's required skills and assignments. */
    public void delete(UUID id) {
        missionRepository.delete(getMission(id));
    }

    // --- Required skills --------------------------------------------------------------------------------------

    public MissionResponse setMissionSkill(UUID missionId, UUID skillId, SetMissionSkillRequest request) {
        final var mission = getMission(missionId);
        final var skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("skill", skillId));

        mission.requireSkill(skill, request == null ? null : request.requiredLevel());
        missionRepository.flush();
        return missionMapper.toMissionResponse(mission);
    }

    public void removeMissionSkill(UUID missionId, UUID skillId) {
        if (!getMission(missionId).removeSkill(skillId)) {
            throw new ResourceNotFoundException("The mission does not require the skill " + skillId);
        }
    }

    // --- Assignments ------------------------------------------------------------------------------------------

    /** Employees can be assigned whatever their skill levels: mismatches are reported, never rejected. */
    public MissionAssignmentResponse createAssignment(UUID missionId, MissionAssignmentRequest request) {
        final var mission = getMission(missionId);
        final var assignment = missionMapper.toMissionAssignment(request);
        assignment.setMission(mission);
        applyAssignmentRules(assignment, request);

        mission.getAssignments().add(assignment);
        // Persist the assignment itself: saving the (already managed) mission would merge a copy of it instead.
        return missionMapper.toMissionAssignmentResponse(missionAssignmentRepository.saveAndFlush(assignment));
    }

    @Transactional(readOnly = true)
    public MissionAssignmentResponse findAssignment(UUID missionId, UUID assignmentId) {
        return missionMapper.toMissionAssignmentResponse(getAssignment(getMission(missionId), assignmentId));
    }

    public MissionAssignmentResponse updateAssignment(UUID missionId, UUID assignmentId,
            MissionAssignmentRequest request) {
        final var assignment = getAssignment(getMission(missionId), assignmentId);
        OptimisticLocking.checkVersion("assignment", assignment.getVersion(), request.version());
        missionMapper.updateMissionAssignment(request, assignment);
        applyAssignmentRules(assignment, request);
        return missionMapper.toMissionAssignmentResponse(missionAssignmentRepository.saveAndFlush(assignment));
    }

    /** Also opens again the need the assignment filled, if any. */
    public void deleteAssignment(UUID missionId, UUID assignmentId) {
        final var mission = getMission(missionId);
        mission.removeAssignment(getAssignment(mission, assignmentId));
    }

    /**
     * Moves an assignment in time without touching anything else (used by drag and drop on timelines). Days worked
     * are capped to the new period if it became shorter.
     */
    public MissionAssignmentResponse moveAssignment(UUID missionId, UUID assignmentId, AssignmentPeriodRequest request) {
        final var assignment = getAssignment(getMission(missionId), assignmentId);
        OptimisticLocking.checkVersion("assignment", assignment.getVersion(), request.version());
        if (request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleViolationException("The end date cannot be before the start date");
        }
        assignment.setStartDate(request.startDate());
        assignment.setEndDate(request.endDate());
        if (request.endDate() != null && assignment.getDuration() != null) {
            final var periodInDays = (int) ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;
            assignment.setDuration(Math.min(assignment.getDuration(), periodInDays));
        }
        return missionMapper.toMissionAssignmentResponse(missionAssignmentRepository.saveAndFlush(assignment));
    }

    // --- Needs (open positions) -------------------------------------------------------------------------------

    public MissionResponse createNeed(UUID missionId, MissionNeedRequest request) {
        final var mission = getMission(missionId);
        checkNeedPeriod(request);
        final var need = missionMapper.toMissionNeed(request);
        need.setMission(mission);
        need.setRole(findRole(request.roleId()));
        mission.getNeeds().add(need);
        missionNeedRepository.saveAndFlush(need);
        return missionMapper.toMissionResponse(mission);
    }

    public MissionResponse updateNeed(UUID missionId, UUID needId, MissionNeedRequest request) {
        final var mission = getMission(missionId);
        final var need = getNeed(mission, needId);
        OptimisticLocking.checkVersion("need", need.getVersion(), request.version());
        checkNeedPeriod(request);
        missionMapper.updateMissionNeed(request, need);
        need.setRole(findRole(request.roleId()));
        missionNeedRepository.saveAndFlush(need);
        return missionMapper.toMissionResponse(mission);
    }

    /** Deleting a filled need keeps its assignment. */
    public void deleteNeed(UUID missionId, UUID needId) {
        final var mission = getMission(missionId);
        mission.getNeeds().remove(getNeed(mission, needId));
    }

    /** Assigns the employee to the mission with the need's dates and rate, and marks the need as filled. */
    public MissionResponse fillNeed(UUID missionId, UUID needId, FillNeedRequest request) {
        final var mission = getMission(missionId);
        final var need = getNeed(mission, needId);
        if (!need.isOpen()) {
            throw new ConflictException("This need is already filled by %s %s".formatted(
                    need.getFilledBy().getEmployee().getFirstName(), need.getFilledBy().getEmployee().getLastName()));
        }
        final var assignmentRequest = new MissionAssignmentRequest(request.employeeId(), need.getStartDate(),
                need.getEndDate(), null, need.getRate(), null, need.getComment(), null);
        final var assignment = missionMapper.toMissionAssignment(assignmentRequest);
        assignment.setMission(mission);
        applyAssignmentRules(assignment, assignmentRequest);
        mission.getAssignments().add(assignment);
        need.setFilledBy(missionAssignmentRepository.saveAndFlush(assignment));
        missionNeedRepository.saveAndFlush(need);
        return missionMapper.toMissionResponse(mission);
    }

    /** Most recent first; undated assignments last. */
    @Transactional(readOnly = true)
    public List<EmployeeAssignmentResponse> findAssignmentsOfEmployee(UUID employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("employee", employeeId);
        }
        return missionAssignmentRepository.findByEmployeeId(employeeId).stream()
                .sorted(Comparator.comparing(MissionAssignment::getStartDate,
                        Comparator.nullsLast(Comparator.<LocalDate>reverseOrder())))
                .map(missionMapper::toEmployeeAssignmentResponse).toList();
    }

    // --- Helpers ----------------------------------------------------------------------------------------------

    private Mission getMission(UUID id) {
        return missionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("mission", id));
    }

    private static MissionNeed getNeed(Mission mission, UUID needId) {
        return mission.findNeed(needId).orElseThrow(
                () -> new ResourceNotFoundException("The mission has no need with the id " + needId));
    }

    private Role findRole(UUID roleId) {
        return roleId == null ? null : roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessRuleViolationException("No role exists with the id " + roleId));
    }

    private static void checkNeedPeriod(MissionNeedRequest request) {
        if (request.startDate() != null && request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleViolationException("The end date cannot be before the start date");
        }
    }

    private static MissionAssignment getAssignment(Mission mission, UUID assignmentId) {
        return mission.findAssignment(assignmentId).orElseThrow(
                () -> new ResourceNotFoundException("The mission has no assignment with the id " + assignmentId));
    }

    private void assignCustomerAndProjectManager(Mission mission, MissionCreationUpdateRequest request) {
        mission.setCustomer(customerRepository.findById(request.customerId()).orElseThrow(
                () -> new BusinessRuleViolationException("No customer exists with the id " + request.customerId())));
        mission.setProjectManager(request.projectManagerId() == null ? null : findReferencedEmployee(
                request.projectManagerId(), "project manager"));
    }

    private void applyAssignmentRules(MissionAssignment assignment, MissionAssignmentRequest request) {
        final var start = request.startDate();
        final var end = request.endDate();

        if (start != null && end != null) {
            if (end.isBefore(start)) {
                throw new BusinessRuleViolationException("The end date cannot be before the start date");
            }
            final var periodInDays = ChronoUnit.DAYS.between(start, end) + 1;
            if (request.duration() != null && request.duration() > periodInDays) {
                throw new BusinessRuleViolationException(
                        "The duration (%d days) cannot exceed the period between the start and end dates (%d days)"
                                .formatted(request.duration(), periodInDays));
            }
        }

        assignment.assignTo(findReferencedEmployee(request.employeeId(), "employee"));
    }

    private Employee findReferencedEmployee(UUID id, String role) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleViolationException("No %s exists with the id %s".formatted(role, id)));
    }

}
