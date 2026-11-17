package com.brahimsadik.staffinghub.config;

import java.util.List;

/**
 * What a user may do. Each role includes the ones before it.
 * <ul>
 * <li>VIEWER: read everything.</li>
 * <li>STAFFER: also manage employees, absences, missions, assignments and open positions.</li>
 * <li>ADMIN: also manage reference data (customers, roles, technologies, skills) and delete employees.</li>
 * </ul>
 */
public enum AppRole {
    VIEWER, STAFFER, ADMIN;

    /** The Spring Security authorities of this role: its own and the ones it includes (e.g. ROLE_ADMIN, ROLE_STAFFER...). */
    public List<String> authorities() {
        return java.util.Arrays.stream(values()).filter(role -> role.ordinal() <= ordinal())
                .map(role -> "ROLE_" + role.name()).toList();
    }
}
