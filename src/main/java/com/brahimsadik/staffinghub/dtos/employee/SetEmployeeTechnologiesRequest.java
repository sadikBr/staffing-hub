package com.brahimsadik.staffinghub.dtos.employee;

import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class SetEmployeeTechnologiesRequest {

    private List<UUID> technologiesIds;

}
