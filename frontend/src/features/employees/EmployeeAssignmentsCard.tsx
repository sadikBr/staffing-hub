import { Badge, Group, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useEmployeeAssignments } from '@/api/hooks/employees';
import { MissionStatusBadge, OverbookedBadge } from '@/components/badges';
import { EmptyState } from '@/components/EmptyState';
import { QueryError } from '@/components/QueryError';
import { SectionCard } from '@/components/SectionCard';
import { TableSkeleton } from '@/components/TableSkeleton';
import { formatPercent, formatPeriod } from '@/lib/format';
import { SkillMatchSummary } from '../missions/SkillMatchSummary';

export function EmployeeAssignmentsCard({ employeeId }: { employeeId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const assignments = useEmployeeAssignments(employeeId);

  return (
    <SectionCard
      title={t('employees.assignments.title')}
      description={t('employees.assignments.description')}
      flush
    >
      {assignments.isPending ? (
        <TableSkeleton rows={3} columns={3} />
      ) : assignments.isError ? (
        <div style={{ padding: 'var(--mantine-spacing-md)' }}>
          <QueryError error={assignments.error} onRetry={() => void assignments.refetch()} />
        </div>
      ) : assignments.data.length === 0 ? (
        <EmptyState
          compact
          icon={<IconBriefcase size={22} />}
          title={t('employees.assignments.emptyTitle')}
          description={t('employees.assignments.emptyDescription')}
        />
      ) : (
        <Table.ScrollContainer minWidth={640}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('missions.columns.mission')}</Table.Th>
                <Table.Th>{t('missions.assignments.period')}</Table.Th>
                <Table.Th ta="right">{t('missions.assignments.rate')}</Table.Th>
                <Table.Th>{t('missions.assignments.skills')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {assignments.data.map((assignment) => (
                <Table.Tr key={assignment.id} className="clickable-row" onClick={() => navigate(`/missions/${assignment.mission.id}`)}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Group gap={6} wrap="nowrap">
                        <Text size="sm" fw={600}>
                          {assignment.mission.label}
                        </Text>
                        <MissionStatusBadge value={assignment.mission.status} size="xs" />
                      </Group>
                      <Text size="xs" c="dimmed">
                        {assignment.mission.customer.label} · {assignment.mission.projectName}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatPeriod(assignment.startDate, assignment.endDate)}</Text>
                    {assignment.duration != null && (
                      <Text size="xs" c="dimmed">
                        {t('missions.assignments.daysWorked', { count: assignment.duration })}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Stack gap={4} align="flex-end">
                      <Text size="sm" className="tabular-nums">
                        {formatPercent(assignment.rate)}
                      </Text>
                      {assignment.employeeOccupation?.overbooked && (
                        <Tooltip label={t('missions.assignments.overbookedTooltip', { value: formatPercent(assignment.employeeOccupation.peakRate) })}>
                          <span>
                            <OverbookedBadge size="xs" />
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {assignment.skillMatches.length === 0 ? (
                      <Badge variant="transparent" color="gray" size="sm">
                        {t('missions.assignments.noRequirements')}
                      </Badge>
                    ) : (
                      <SkillMatchSummary matches={assignment.skillMatches} />
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </SectionCard>
  );
}
