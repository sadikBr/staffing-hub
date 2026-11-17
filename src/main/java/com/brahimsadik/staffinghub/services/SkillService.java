package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.skill.SkillCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.exceptions.BusinessRuleViolationException;
import com.brahimsadik.staffinghub.exceptions.ConflictException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.SkillMapper;
import com.brahimsadik.staffinghub.models.Skill;
import com.brahimsadik.staffinghub.models.Technology;
import com.brahimsadik.staffinghub.repositories.EmployeeSkillRepository;
import com.brahimsadik.staffinghub.repositories.SkillRepository;
import com.brahimsadik.staffinghub.repositories.TechnologyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SkillService {

    private final SkillRepository skillRepository;
    private final TechnologyRepository technologyRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillMapper skillMapper;

    public SkillResponse create(SkillCreationUpdateRequest request) {
        final var technology = getReferencedTechnology(request.technologyId());
        if (skillRepository.existsByTechnologyIdAndLabel(technology.getId(), request.label())) {
            throw duplicateLabel(request.label(), technology);
        }

        final var skill = skillMapper.toSkill(request);
        skill.setTechnology(technology);
        return skillMapper.toSkillResponse(skillRepository.save(skill));
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> findAllSkills() {
        return skillRepository.findAll(Sort.by("label")).stream().map(skillMapper::toSkillResponse).toList();
    }

    @Transactional(readOnly = true)
    public SkillResponse findSkillById(UUID id) {
        return skillMapper.toSkillResponse(getSkill(id));
    }

    public SkillResponse updateSkillById(UUID id, SkillCreationUpdateRequest request) {
        final var skill = getSkill(id);
        final var technology = getReferencedTechnology(request.technologyId());

        if (skillRepository.existsByTechnologyIdAndLabelAndIdNot(technology.getId(), request.label(), id)) {
            throw duplicateLabel(request.label(), technology);
        }

        // Employees may only have skills in their own technologies, so a skill that is in use cannot be moved.
        final var technologyChanged = !skill.getTechnology().getId().equals(technology.getId());
        if (technologyChanged && employeeSkillRepository.existsBySkillId(id)) {
            throw new ConflictException(
                    "The skill is assigned to employees, so its technology cannot be changed");
        }

        skillMapper.updateSkill(request, skill);
        skill.setTechnology(technology);
        return skillMapper.toSkillResponse(skillRepository.saveAndFlush(skill));
    }

    /** Also removes the skill from every employee that has it. */
    public void delete(UUID id) {
        skillRepository.delete(getSkill(id));
    }

    private Skill getSkill(UUID id) {
        return skillRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("skill", id));
    }

    private Technology getReferencedTechnology(UUID technologyId) {
        return technologyRepository.findById(technologyId).orElseThrow(
                () -> new BusinessRuleViolationException("No technology exists with the id " + technologyId));
    }

    private static ConflictException duplicateLabel(String label, Technology technology) {
        return new ConflictException(
                "The technology '%s' already has a skill labelled '%s'".formatted(technology.getLabel(), label));
    }

}
