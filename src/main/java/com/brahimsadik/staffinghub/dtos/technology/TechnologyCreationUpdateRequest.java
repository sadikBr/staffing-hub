package com.brahimsadik.staffinghub.dtos.technology;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TechnologyCreationUpdateRequest(@NotBlank @Size(max = 255) String label) {
}
