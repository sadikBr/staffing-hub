package com.brahimsadik.staffinghub.dtos.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @param version on update, the version that was read. If the role changed since, the update is refused (409)
 *                instead of overwriting the other change. Ignored on creation.
 */
public record RoleCreationUpdateRequest(@NotBlank @Size(max = 255) String label, Long version) {
}
