import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { unwrap } from '../errors';
import type { AbsenceRequest } from '../types';

/** An employee's absences, most recent first. */
export function useAbsences(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employees', 'absences', employeeId],
    queryFn: () => unwrap(api.GET('/api/employees/{employeeId}/absences', { params: { path: { employeeId: employeeId! } } })),
    enabled: Boolean(employeeId),
  });
}

export const absenceApi = {
  create: ({ employeeId, body }: { employeeId: string; body: AbsenceRequest }) =>
    unwrap(api.POST('/api/employees/{employeeId}/absences', { params: { path: { employeeId } }, body })),
  update: ({ employeeId, absenceId, body }: { employeeId: string; absenceId: string; body: AbsenceRequest }) =>
    unwrap(api.PUT('/api/employees/{employeeId}/absences/{absenceId}', { params: { path: { employeeId, absenceId } }, body })),
  remove: ({ employeeId, absenceId }: { employeeId: string; absenceId: string }) =>
    unwrap(api.DELETE('/api/employees/{employeeId}/absences/{absenceId}', { params: { path: { employeeId, absenceId } } })),
};
