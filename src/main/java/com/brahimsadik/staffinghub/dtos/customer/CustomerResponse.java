package com.brahimsadik.staffinghub.dtos.customer;

import java.time.Instant;
import java.util.UUID;

public record CustomerResponse(UUID id, String label, Long version, Instant createdAt, Instant updatedAt) {
}
