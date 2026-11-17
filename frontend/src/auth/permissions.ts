import { createContext, useContext } from 'react';
import type { Me } from '@/api/types';

export interface Permissions {
  role: Me['role'];
  /** Manage employees, absences, missions, assignments and open positions. */
  canEdit: boolean;
  /** Also manage reference data (customers, roles, technologies, skills) and delete employees. */
  canAdmin: boolean;
}

export const FULL_PERMISSIONS: Permissions = { role: 'ADMIN', canEdit: true, canAdmin: true };

// Without a provider (e.g. in component tests), everything is allowed: the API is what enforces permissions.
export const PermissionsContext = createContext<Permissions>(FULL_PERMISSIONS);

export function usePermissions(): Permissions {
  return useContext(PermissionsContext);
}
