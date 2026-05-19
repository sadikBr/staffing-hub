package com.brahimsadik.staffinghub.dtos.role;

import java.util.UUID;

import lombok.Data;

@Data
public class RoleResponse {

    private UUID id;

    private String label;

}
