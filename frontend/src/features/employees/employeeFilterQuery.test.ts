import { describe, expect, it } from 'vitest';
import { EMPLOYEE_FILTER_KEYS, toEmployeeQuery, type EmployeeFilterValues } from './employeeFilterQuery';

const empty = Object.fromEntries(EMPLOYEE_FILTER_KEYS.map((key) => [key, ''])) as EmployeeFilterValues;

describe('toEmployeeQuery', () => {
  it('leaves unset filters out', () => {
    expect(Object.values(toEmployeeQuery(empty)).every((value) => value === undefined)).toBe(true);
  });

  it("asks for a manager's whole team only when a manager is chosen", () => {
    expect(toEmployeeQuery({ ...empty, managerId: 'm1', includeIndirectReports: 'true' })).toMatchObject({
      managerId: 'm1',
      includeIndirectReports: true,
    });
    expect(toEmployeeQuery({ ...empty, includeIndirectReports: 'true' }).includeIndirectReports).toBeUndefined();
  });

  it('only sends a minimum level together with a skill', () => {
    expect(toEmployeeQuery({ ...empty, minSkillLevel: 'EXPERT' }).minSkillLevel).toBeUndefined();
    expect(toEmployeeQuery({ ...empty, skillId: 's1', minSkillLevel: 'EXPERT' }).minSkillLevel).toBe('EXPERT');
  });
});
