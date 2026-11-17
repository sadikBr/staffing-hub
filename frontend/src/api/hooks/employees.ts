import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { unwrap } from '../errors';
import type { paths } from '../schema';
import type { EmployeeRequest, SkillLevel } from '../types';

export type EmployeeSearchParams = NonNullable<paths['/api/employees']['get']['parameters']['query']>;
export type AvailabilityParams = paths['/api/employees/availability']['get']['parameters']['query'];

export function useEmployees(params: EmployeeSearchParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['employees', 'list', params],
    queryFn: () => unwrap(api.GET('/api/employees', { params: { query: params } })),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employees', 'detail', id],
    queryFn: () => unwrap(api.GET('/api/employees/{id}', { params: { path: { id: id! } } })),
    enabled: Boolean(id),
  });
}

export function useEmployeeAssignments(id: string | undefined) {
  return useQuery({
    queryKey: ['employees', 'assignments', id],
    queryFn: () => unwrap(api.GET('/api/employees/{id}/assignments', { params: { path: { id: id! } } })),
    enabled: Boolean(id),
  });
}

export function useAvailability(params: AvailabilityParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['availability', params],
    queryFn: () => unwrap(api.GET('/api/employees/availability', { params: { query: params } })),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export const employeeApi = {
  create: (body: EmployeeRequest) => unwrap(api.POST('/api/employees', { body })),
  update: ({ id, body }: { id: string; body: EmployeeRequest }) =>
    unwrap(api.PUT('/api/employees/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/employees/{id}', { params: { path: { id } } })),
  setRoles: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
    unwrap(api.PUT('/api/employees/{id}/roles', { params: { path: { id } }, body: { roleIds } })),
  setTechnologies: ({ id, technologyIds }: { id: string; technologyIds: string[] }) =>
    unwrap(api.PUT('/api/employees/{id}/technologies', { params: { path: { id } }, body: { technologyIds } })),
  setSkillLevel: ({ id, skillId, level }: { id: string; skillId: string; level: SkillLevel }) =>
    unwrap(api.PUT('/api/employees/{id}/skills/{skillId}', { params: { path: { id, skillId } }, body: { level } })),
  removeSkill: ({ id, skillId }: { id: string; skillId: string }) =>
    unwrap(api.DELETE('/api/employees/{id}/skills/{skillId}', { params: { path: { id, skillId } } })),
};
