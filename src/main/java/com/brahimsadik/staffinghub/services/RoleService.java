package com.brahimsadik.staffinghub.services;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.brahimsadik.staffinghub.dtos.role.RoleCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.mappers.RoleMapper;
import com.brahimsadik.staffinghub.models.Role;
import com.brahimsadik.staffinghub.repositories.RoleRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleResponse create(RoleCreationUpdateRequest request) {
        try {
            final var role = roleMapper.toRole(request);

            final var persistedRole = roleRepository.save(role);

            return roleMapper.toRoleResponse(persistedRole);
        } catch (final DataIntegrityViolationException e) {
            throw new RuntimeException(String.format("Role with label {%s} already exists", request.getLabel()));
        }
    }

    public List<RoleResponse> findAllRoles() {
        final var allRoles = (List<Role>) roleRepository.findAll();
        return allRoles.stream().map(role -> roleMapper.toRoleResponse(role)).toList();
    }

    public RoleResponse findRoleById(UUID id) {
        final var role = roleRepository.findById(id).orElse(null);
        if (role == null) {
            throw new RuntimeException("No role exists with the id: " + id);
        }

        return roleMapper.toRoleResponse(role);
    }

    public RoleResponse updateRoleById(UUID id, RoleCreationUpdateRequest request) {
        final var role = roleRepository.findById(id).orElse(null);
        if (role == null) {
            throw new RuntimeException("No role exists with the id: " + id);
        }

        role.setLabel(request.getLabel());
        final var persistedRole = roleRepository.save(role);

        return roleMapper.toRoleResponse(persistedRole);
    }

    public void delete(UUID id) {
        final var role = roleRepository.findById(id).orElse(null);
        if (role == null) {
            throw new RuntimeException("No role exists with the id: " + id);
        }

        roleRepository.delete(role);
    }

}
