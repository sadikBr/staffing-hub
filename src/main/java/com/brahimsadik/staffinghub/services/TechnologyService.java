package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.technology.TechnologyCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyWithSkillsResponse;
import com.brahimsadik.staffinghub.exceptions.ConflictException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.TechnologyMapper;
import com.brahimsadik.staffinghub.models.Technology;
import com.brahimsadik.staffinghub.repositories.TechnologyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TechnologyService {

    private final TechnologyRepository technologyRepository;
    private final TechnologyMapper technologyMapper;

    public TechnologyResponse create(TechnologyCreationUpdateRequest request) {
        if (technologyRepository.existsByLabel(request.label())) {
            throw duplicateLabel(request.label());
        }

        final var technology = technologyRepository.save(technologyMapper.toTechnology(request));
        return technologyMapper.toTechnologyResponse(technology);
    }

    @Transactional(readOnly = true)
    public List<TechnologyWithSkillsResponse> findAllTechnologies() {
        return technologyRepository.findAll(Sort.by("label")).stream()
                .map(technologyMapper::toTechnologyWithSkillsResponse).toList();
    }

    @Transactional(readOnly = true)
    public TechnologyWithSkillsResponse findTechnologyById(UUID id) {
        return technologyMapper.toTechnologyWithSkillsResponse(getTechnology(id));
    }

    public TechnologyResponse updateTechnologyById(UUID id, TechnologyCreationUpdateRequest request) {
        final var technology = getTechnology(id);
        if (technologyRepository.existsByLabelAndIdNot(request.label(), id)) {
            throw duplicateLabel(request.label());
        }

        technologyMapper.updateTechnology(request, technology);
        return technologyMapper.toTechnologyResponse(technologyRepository.saveAndFlush(technology));
    }

    /** Also deletes the technology's skills, and removes both from every employee. */
    public void delete(UUID id) {
        technologyRepository.delete(getTechnology(id));
    }

    private Technology getTechnology(UUID id) {
        return technologyRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("technology", id));
    }

    private static ConflictException duplicateLabel(String label) {
        return new ConflictException("A technology with the label '%s' already exists".formatted(label));
    }

}
