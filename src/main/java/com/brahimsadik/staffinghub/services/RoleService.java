package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brahimsadik.staffinghub.dtos.role.RoleCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.exceptions.ConflictException;
import com.brahimsadik.staffinghub.exceptions.ResourceNotFoundException;
import com.brahimsadik.staffinghub.mappers.RoleMapper;
import com.brahimsadik.staffinghub.models.Role;
import com.brahimsadik.staffinghub.repositories.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleResponse create(RoleCreationUpdateRequest request) {
        if (roleRepository.existsByLabel(request.label())) {
            throw duplicateLabel(request.label());
        }

        final var role = roleRepository.save(roleMapper.toRole(request));
        return roleMapper.toRoleResponse(role);
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> findAllRoles() {
        return roleRepository.findAll(Sort.by("label")).stream().map(roleMapper::toRoleResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse findRoleById(UUID id) {
        return roleMapper.toRoleResponse(getRole(id));
    }

    public RoleResponse updateRoleById(UUID id, RoleCreationUpdateRequest request) {
        final var role = getRole(id);
        if (roleRepository.existsByLabelAndIdNot(request.label(), id)) {
            throw duplicateLabel(request.label());
        }

        roleMapper.updateRole(request, role);
        return roleMapper.toRoleResponse(roleRepository.saveAndFlush(role));
    }

    public void delete(UUID id) {
        roleRepository.delete(getRole(id));
    }

    private Role getRole(UUID id) {
        return roleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("role", id));
    }

    private static ConflictException duplicateLabel(String label) {
        return new ConflictException("A role with the label '%s' already exists".formatted(label));
    }

}
