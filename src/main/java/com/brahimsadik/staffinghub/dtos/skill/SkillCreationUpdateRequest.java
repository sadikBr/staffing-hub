package com.brahimsadik.staffinghub.dtos.skill;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** @param version on update, the version that was read (see the other update requests). Ignored on creation. */
public record SkillCreationUpdateRequest(@NotBlank @Size(max = 255) String label, @NotNull UUID technologyId,
        Long version) {
}
