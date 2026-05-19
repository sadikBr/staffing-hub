package com.brahimsadik.staffinghub.mappers;

import org.mapstruct.Mapper;

import com.brahimsadik.staffinghub.dtos.role.RoleCreationUpdateRequest;
import com.brahimsadik.staffinghub.dtos.role.RoleResponse;
import com.brahimsadik.staffinghub.models.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toRoleResponse(Role role);

    Role toRole(RoleCreationUpdateRequest request);

}
