package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.brahimsadik.staffinghub.dtos.skill.SkillCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.skill.SkillResponse;
import com.brahimsadik.staffinghub.mappers.SkillMapper;
import com.brahimsadik.staffinghub.models.Skill;
import com.brahimsadik.staffinghub.repositories.SkillRepository;
import com.brahimsadik.staffinghub.repositories.TechnologyRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final TechnologyRepository technologyRepository;
    private final SkillMapper skillMapper;

    public SkillResponse create(SkillCreationUpdateRequest request) {
        try {
            final var technology = technologyRepository.findById(request.getTechnologyId()).orElse(null);
            if (technology == null) {
                throw new RuntimeException(
                        String.format("No technology found with id {%s}", request.getTechnologyId()));
            }

            final var skill = skillMapper.toSkill(request);
            skill.setTechnology(technology);
            final var persistedSkill = skillRepository.save(skill);

            return skillMapper.toSkillResponse(persistedSkill);
        } catch (final DataIntegrityViolationException e) {
            throw new RuntimeException(String.format("Skill with label {%s} already exists", request.getLabel()));
        }
    }

    public List<SkillResponse> findAllSkills() {
        final var allSkills = (List<Skill>) skillRepository.findAll();
        return allSkills.stream().map(skill -> skillMapper.toSkillResponse(skill)).toList();
    }

    public SkillResponse findSkillById(UUID id) {
        final var skill = skillRepository.findById(id).orElse(null);
        if (skill == null) {
            throw new RuntimeException("No skill exists with the id: " + id);
        }

        return skillMapper.toSkillResponse(skill);
    }

    public SkillResponse updateSkillById(UUID id, SkillCreationUpdateRequest request) {
        final var skill = skillRepository.findById(id).orElse(null);
        if (skill == null) {
            throw new RuntimeException("No skill exists with the id: " + id);
        }

        final var technology = technologyRepository.findById(request.getTechnologyId()).orElse(null);
        if (technology == null) {
            throw new RuntimeException("No technology exists with the id: " + request.getTechnologyId());
        }

        skill.setLabel(request.getLabel());
        skill.setTechnology(technology);
        skillRepository.save(skill);

        return skillMapper.toSkillResponse(skill);
    }

    public void delete(UUID id) {
        final var skill = skillRepository.findById(id).orElse(null);
        if (skill == null) {
            throw new RuntimeException("No skill exists with the id: " + id);
        }

        skillRepository.delete(skill);
    }

}
