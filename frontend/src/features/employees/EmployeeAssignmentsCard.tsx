import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAbsences } from '@/api/hooks/absences';
import { useEmployeeAssignments } from '@/api/hooks/employees';
import type { EmployeeAssignment } from '@/api/types';
import { MissionStatusBadge, OverbookedBadge, Tag } from '@/components/badges';
import { EmptyState } from '@/components/EmptyState';
import { QueryError } from '@/components/QueryError';
import { Section } from '@/components/Section';
import { TableSkeleton } from '@/components/TableSkeleton';
import { TimelineAxis, TimelineTrack, type TimelineBar } from '@/components/Timeline';
import { formatPercent, formatPeriod } from '@/lib/format';
import { missionColor, rangeAround } from '@/lib/timeline';
import { SkillMatchSummary } from '../missions/SkillMatchSummary';
import classes from './EmployeeAssignmentsCard.module.css';

export function EmployeeAssignmentsCard({ employeeId }: { employeeId: string }) {
  const { t } = useTranslation();
  const assignments = useEmployeeAssignments(employeeId);
  const absences = useAbsences(employeeId);

  const bars = useMemo<TimelineBar[]>(
    () =>
      (assignments.data ?? []).map((assignment) => ({
        id: assignment.id,
        start: assignment.startDate,
        end: assignment.endDate,
        rate: assignment.rate,
        label: assignment.mission.label,
        color: missionColor(assignment.mission.id),
        to: `/missions/${assignment.mission.id}`,
        detail: `${assignment.mission.customer.label} · ${formatPeriod(assignment.startDate, assignment.endDate)}`,
      })),
    [assignments.data],
  );
  const range = useMemo(() => rangeAround(bars), [bars]);
  const away = useMemo(
    () =>
      (absences.data ?? []).map((absence) => ({
        id: absence.id,
        start: absence.startDate,
        end: absence.endDate,
        label: t(`absences.types.${absence.type}`),
      })),
    [absences.data, t],
  );
  const scheduled = bars.some((bar) => bar.start);

  return (
    <Section
      title={t('employees.assignments.title')}
      description={t('employees.assignments.description')}
      icon={<IconBriefcase size={17} stroke={1.8} />}
      sheet="padded"
    >
      {assignments.isPending ? (
        <TableSkeleton rows={3} columns={3} />
      ) : assignments.isError ? (
        <QueryError error={assignments.error} onRetry={() => void assignments.refetch()} />
      ) : assignments.data.length === 0 ? (
        <EmptyState
          compact
          icon={<IconBriefcase size={22} stroke={1.5} />}
          title={t('employees.assignments.emptyTitle')}
          description={t('employees.assignments.emptyDescription')}
        />
      ) : (
        <>
          {scheduled && (
            <div className={classes.timeline}>
              <TimelineAxis range={range} />
              <TimelineTrack range={range} bars={bars} absences={away} highlightOverbooked />
            </div>
          )}
          <div>
            {assignments.data.map((assignment) => (
              <AssignmentRow key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

function AssignmentRow({ assignment }: { assignment: EmployeeAssignment }) {
  const { t } = useTranslation();
  return (
    <Link to={`/missions/${assignment.mission.id}`} className={classes.row}>
      <span className={classes.swatch} style={{ background: missionColor(assignment.mission.id) }} />
      <div className={classes.main}>
        <Group gap={8} wrap="nowrap">
          <Text fw={600} truncate>
            {assignment.mission.label}
          </Text>
          <MissionStatusBadge value={assignment.mission.status} size="xs" />
        </Group>
        <Text size="xs" c="dimmed" truncate>
          {assignment.mission.customer.label} · {assignment.mission.projectName}
        </Text>
      </div>
      <div className={classes.period}>
        <Text size="sm">{formatPeriod(assignment.startDate, assignment.endDate)}</Text>
        {assignment.duration != null && (
          <Text size="xs" c="dimmed">
            {t('missions.assignments.daysWorked', { count: assignment.duration })}
          </Text>
        )}
      </div>
      <Stack gap={4} align="flex-end" className={classes.rate}>
        <Text fw={600} className="tabular-nums">
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
      <div className={classes.match}>
        {assignment.skillMatches.length === 0 ? (
          <Tag size="xs">{t('missions.assignments.noRequirements')}</Tag>
        ) : (
          <SkillMatchSummary matches={assignment.skillMatches} />
        )}
      </div>
    </Link>
  );
}
