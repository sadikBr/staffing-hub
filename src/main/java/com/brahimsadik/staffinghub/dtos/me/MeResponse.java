package com.brahimsadik.staffinghub.dtos.me;

import com.brahimsadik.staffinghub.config.AppRole;

/**
 * What the current user may do, so that the frontend can hide what they cannot use.
 *
 * @param canEdit  manage employees, absences, missions, assignments and open positions
 * @param canAdmin also manage reference data and delete employees
 */
public record MeResponse(AppRole role, boolean canEdit, boolean canAdmin) {
}
