package com.brahimsadik.staffinghub.dtos.employee;

import java.util.UUID;

/** A lightweight reference to another employee (a manager or a member of someone's staff). */
public record EmployeeSummary(UUID id, String firstName, String lastName) {
}
