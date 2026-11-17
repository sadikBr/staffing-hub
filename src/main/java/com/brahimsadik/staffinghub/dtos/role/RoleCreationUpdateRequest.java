package com.brahimsadik.staffinghub.dtos.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoleCreationUpdateRequest(@NotBlank @Size(max = 255) String label) {
}
