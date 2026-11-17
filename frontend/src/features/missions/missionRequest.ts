import type { Mission } from '@/api/types';

/** The update request that leaves the mission unchanged (to change one field, e.g. the status). */
export function toMissionRequest(mission: Mission) {
  return {
    label: mission.label,
    projectName: mission.projectName,
    customerId: mission.customer.id,
    status: mission.status,
    businessUnit: mission.businessUnit,
    projectManagerId: mission.projectManager?.id,
    starUrl: mission.starUrl,
    description: mission.description,
    comment: mission.comment,
    version: mission.version,
  };
}
