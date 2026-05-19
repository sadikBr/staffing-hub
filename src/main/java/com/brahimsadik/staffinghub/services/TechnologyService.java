package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.brahimsadik.staffinghub.dtos.technology.TechnologyCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.technology.TechnologyResponse;
import com.brahimsadik.staffinghub.mappers.TechnologyMapper;
import com.brahimsadik.staffinghub.repositories.TechnologyRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TechnologyService {

    private final TechnologyRepository technologyRepository;
    private final TechnologyMapper technologyMapper;

    public TechnologyResponse create(TechnologyCreationUpdateRequest request) {
        try {
            final var technology = technologyMapper.toTechnology(request);

            final var persistedTechnology = technologyRepository.save(technology);

            return technologyMapper.toTechnologyResponse(persistedTechnology);
        } catch (final DataIntegrityViolationException e) {
            throw new RuntimeException(String.format("Technology with label {%s} already exists", request.getLabel()));
        }
    }

    public List<TechnologyResponse> findAllTechnologies() {
        final var allTechnologies = technologyRepository.findAll();
        return allTechnologies.stream().map(tech -> technologyMapper.toTechnologyResponse(tech)).toList();
    }

    public TechnologyResponse findTechnologyById(UUID id) {
        final var technology = technologyRepository.findById(id).orElse(null);
        if (technology == null) {
            throw new RuntimeException("No technology exists with the id: " + id);
        }

        return technologyMapper.toTechnologyResponse(technology);
    }

    public TechnologyResponse updateTechnologyById(UUID id, TechnologyCreationUpdateRequest request) {
        final var technology = technologyRepository.findById(id).orElse(null);
        if (technology == null) {
            throw new RuntimeException("No technology exists with the id: " + id);
        }

        technology.setLabel(request.getLabel());
        final var persistedTechnology = technologyRepository.save(technology);

        return technologyMapper.toTechnologyResponse(persistedTechnology);
    }

    public void delete(UUID id) {
        final var technology = technologyRepository.findById(id).orElse(null);
        if (technology == null) {
            throw new RuntimeException("No technology exists with the id: " + id);
        }

        technologyRepository.delete(technology);
    }

}
