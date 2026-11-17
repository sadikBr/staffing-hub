package com.brahimsadik.staffinghub.dtos.role;

import java.time.Instant;
import java.util.UUID;

public record RoleResponse(UUID id, String label, Long version, Instant createdAt, Instant updatedAt) {
}
