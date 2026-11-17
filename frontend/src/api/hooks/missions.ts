import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { unwrap } from '../errors';
import type { paths } from '../schema';
import type { MissionAssignmentRequest, MissionRequest, SkillLevel } from '../types';

export type MissionSearchParams = NonNullable<paths['/api/missions']['get']['parameters']['query']>;

export function useMissions(params: MissionSearchParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['missions', 'list', params],
    queryFn: () => unwrap(api.GET('/api/missions', { params: { query: params } })),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useMission(id: string | undefined) {
  return useQuery({
    queryKey: ['missions', 'detail', id],
    queryFn: () => unwrap(api.GET('/api/missions/{id}', { params: { path: { id: id! } } })),
    enabled: Boolean(id),
  });
}

export const missionApi = {
  create: (body: MissionRequest) => unwrap(api.POST('/api/missions', { body })),
  update: ({ id, body }: { id: string; body: MissionRequest }) =>
    unwrap(api.PUT('/api/missions/{id}', { params: { path: { id } }, body })),
  remove: (id: string) => unwrap(api.DELETE('/api/missions/{id}', { params: { path: { id } } })),
  setSkill: ({ id, skillId, requiredLevel }: { id: string; skillId: string; requiredLevel: SkillLevel | null }) =>
    unwrap(
      api.PUT('/api/missions/{id}/skills/{skillId}', {
        params: { path: { id, skillId } },
        body: { requiredLevel: requiredLevel ?? undefined },
      }),
    ),
  removeSkill: ({ id, skillId }: { id: string; skillId: string }) =>
    unwrap(api.DELETE('/api/missions/{id}/skills/{skillId}', { params: { path: { id, skillId } } })),
  createAssignment: ({ id, body }: { id: string; body: MissionAssignmentRequest }) =>
    unwrap(api.POST('/api/missions/{id}/assignments', { params: { path: { id } }, body })),
  updateAssignment: ({ id, assignmentId, body }: { id: string; assignmentId: string; body: MissionAssignmentRequest }) =>
    unwrap(api.PUT('/api/missions/{id}/assignments/{assignmentId}', { params: { path: { id, assignmentId } }, body })),
  removeAssignment: ({ id, assignmentId }: { id: string; assignmentId: string }) =>
    unwrap(api.DELETE('/api/missions/{id}/assignments/{assignmentId}', { params: { path: { id, assignmentId } } })),
};
