package com.brahimsadik.staffinghub.dtos.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerCreationUpdateRequest(@NotBlank @Size(max = 255) String label) {
}
