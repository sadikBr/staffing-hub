package com.brahimsadik.staffinghub.mappers;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.brahimsadik.staffinghub.dtos.role.RoleCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.models.Role;

@Mapper(config = CentralMapperConfig.class)
public interface RoleMapper {

    RoleResponse toRoleResponse(Role role);

    Role toRole(RoleCreationUpdateRequest request);

    void updateRole(RoleCreationUpdateRequest request, @MappingTarget Role role);

    default List<RoleResponse> toSortedRoleResponses(Collection<Role> roles) {
        return roles.stream().map(this::toRoleResponse).sorted(Comparator.comparing(RoleResponse::label)).toList();
    }

}
