import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../client';
import i18n from '@/i18n';
import { formatPeriod } from '@/lib/format';
import { unwrap } from '../errors';
import { useApiMutation } from '../useApiMutation';
import type { paths } from '../schema';
import type { MissionAssignmentRequest, MissionNeedRequest, MissionRequest, SkillLevel } from '../types';

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
  /** Changes only the assignment's dates (drag and drop on timelines). */
  moveAssignment: ({ id, assignmentId, body }: { id: string; assignmentId: string; body: { startDate: string; endDate?: string; version?: number } }) =>
    unwrap(api.PATCH('/api/missions/{id}/assignments/{assignmentId}/period', { params: { path: { id, assignmentId } }, body })),
  createNeed: ({ id, body }: { id: string; body: MissionNeedRequest }) =>
    unwrap(api.POST('/api/missions/{id}/needs', { params: { path: { id } }, body })),
  updateNeed: ({ id, needId, body }: { id: string; needId: string; body: MissionNeedRequest }) =>
    unwrap(api.PUT('/api/missions/{id}/needs/{needId}', { params: { path: { id, needId } }, body })),
  removeNeed: ({ id, needId }: { id: string; needId: string }) =>
    unwrap(api.DELETE('/api/missions/{id}/needs/{needId}', { params: { path: { id, needId } } })),
  fillNeed: ({ id, needId, employeeId }: { id: string; needId: string; employeeId: string }) =>
    unwrap(api.POST('/api/missions/{id}/needs/{needId}/fill', { params: { path: { id, needId } }, body: { employeeId } })),
};

/** The best candidates for an open position, best first. */
export function useNeedCandidates(missionId: string, needId: string | undefined) {
  return useQuery({
    queryKey: ['missions', 'candidates', missionId, needId],
    queryFn: () =>
      unwrap(api.GET('/api/missions/{id}/needs/{needId}/candidates', { params: { path: { id: missionId, needId: needId! }, query: { limit: 15 } } })),
    enabled: Boolean(needId),
  });
}

/** Moves an assignment in time (drag and drop), then refreshes every view. */
export function useMoveAssignment() {
  return useApiMutation({
    mutationFn: missionApi.moveAssignment,
    successMessage: (saved) => i18n.t('missions.assignments.moved', { period: formatPeriod(saved.startDate, saved.endDate) }),
  });
}
