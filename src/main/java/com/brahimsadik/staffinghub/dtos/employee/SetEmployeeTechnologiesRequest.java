package com.brahimsadik.staffinghub.dtos.employee;

import java.util.Set;
import java.util.UUID;

import lombok.Data;

@Data
public class SetEmployeeTechnologiesRequest {

    private Set<UUID> technologiesIds;

}
