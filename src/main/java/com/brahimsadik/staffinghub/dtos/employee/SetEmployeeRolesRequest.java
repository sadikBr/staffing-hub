package com.brahimsadik.staffinghub.dtos.employee;

import java.util.Set;
import java.util.UUID;

import lombok.Data;

@Data
public class SetEmployeeRolesRequest {

    private Set<UUID> rolesIds;

}
