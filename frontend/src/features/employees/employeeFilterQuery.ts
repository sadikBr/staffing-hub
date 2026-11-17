import type { Community, Seniority, SkillLevel } from '@/api/types';
import { orUndefined } from '@/lib/useUrlState';

/** URL keys of the employee filters (shared by the employee search and the availability search). */
export const EMPLOYEE_FILTER_KEYS = [
  'search',
  'seniority',
  'community',
  'roleId',
  'technologyId',
  'skillId',
  'minSkillLevel',
  'includeFormer',
] as const;

export type EmployeeFilterValues = Record<(typeof EMPLOYEE_FILTER_KEYS)[number], string>;

/** Turns the URL values into API query parameters. */
export function toEmployeeQuery(values: EmployeeFilterValues) {
  return {
    search: orUndefined(values.search),
    seniority: orUndefined<Seniority>(values.seniority),
    community: orUndefined<Community>(values.community),
    roleId: orUndefined(values.roleId),
    technologyId: orUndefined(values.technologyId),
    skillId: orUndefined(values.skillId),
    minSkillLevel: values.skillId ? orUndefined<SkillLevel>(values.minSkillLevel) : undefined,
    includeFormer: values.includeFormer === 'true' ? true : undefined,
  };
}
