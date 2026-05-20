package com.brahimsadik.staffinghub.dtos.employee;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SetEmployeeRolesRequest {

    private List<UUID> rolesIds;

}
