import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { unwrap } from '../errors';
import type { CustomerRequest, RoleRequest, SkillRequest, TechnologyRequest } from '../types';

// --- Customers ------------------------------------------------------------------------------------------------------

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: () => unwrap(api.GET('/api/customers')) });
}

export const customerApi = {
  create: (body: CustomerRequest) => unwrap(api.POST('/api/customers', { body })),
  update: ({ id, body }: { id: string; body: CustomerRequest }) =>
    unwrap(api.PUT('/api/customers/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/customers/{id}', { params: { path: { id } } })),
};

// --- Roles ----------------------------------------------------------------------------------------------------------

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: () => unwrap(api.GET('/api/roles')) });
}

export const roleApi = {
  create: (body: RoleRequest) => unwrap(api.POST('/api/roles', { body })),
  update: ({ id, body }: { id: string; body: RoleRequest }) =>
    unwrap(api.PUT('/api/roles/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/roles/{id}', { params: { path: { id } } })),
};

// --- Technologies and skills ----------------------------------------------------------------------------------------

/** Every technology with its skills. */
export function useTechnologies() {
  return useQuery({ queryKey: ['technologies'], queryFn: () => unwrap(api.GET('/api/technologies')) });
}

export const technologyApi = {
  create: (body: TechnologyRequest) => unwrap(api.POST('/api/technologies', { body })),
  update: ({ id, body }: { id: string; body: TechnologyRequest }) =>
    unwrap(api.PUT('/api/technologies/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/technologies/{id}', { params: { path: { id } } })),
};

export const skillApi = {
  create: (body: SkillRequest) => unwrap(api.POST('/api/skills', { body })),
  update: ({ id, body }: { id: string; body: SkillRequest }) =>
    unwrap(api.PUT('/api/skills/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/skills/{id}', { params: { path: { id } } })),
};
