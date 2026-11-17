package com.brahimsadik.staffinghub.dtos.technology;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @param version on update, the version that was read. If the technology changed since, the update is refused (409)
 *                instead of overwriting the other change. Ignored on creation.
 */
public record TechnologyCreationUpdateRequest(@NotBlank @Size(max = 255) String label, Long version) {
}
