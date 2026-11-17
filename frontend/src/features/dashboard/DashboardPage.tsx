import { Button, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowUpRight, IconBriefcase, IconCalendarDue, IconChartBar, IconPlus, IconUserSearch, IconUsers } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useDashboard } from '@/api/hooks/dashboard';
import { useAvailability } from '@/api/hooks/employees';
import type { Dashboard, MissionStatus } from '@/api/types';
import { useSession } from '@/auth/session';
import { usePermissions } from '@/auth/permissions';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { Section } from '@/components/Section';
import { MISSION_STATUSES } from '@/lib/enums';
import { missionColor } from '@/lib/timeline';
import { needTitle } from '../missions/needTitle';
import { daysFromToday, formatPercent, formatPeriod } from '@/lib/format';
import dayjs from 'dayjs';
import { EmployeeFormModal } from '../employees/EmployeeFormModal';
import { MissionFormModal } from '../missions/MissionFormModal';
import { CapacityBoard } from './CapacityBoard';
import classes from './DashboardPage.module.css';

function greetingKey(): 'dashboard.greeting.morning' | 'dashboard.greeting.afternoon' | 'dashboard.greeting.evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting.morning';
  if (hour < 18) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const session = useSession();
  const { canEdit } = usePermissions();
  const dashboard = useDashboard();
  const [newEmployee, newEmployeeModal] = useDisclosure();
  const [newMission, newMissionModal] = useDisclosure();
  const firstName = session.userName?.split(/\s+/)[0];

  return (
    <>
      <PageHeader
        eyebrow={
          dashboard.data
            ? t('dashboard.eyebrow', { period: formatPeriod(dashboard.data.from, dashboard.data.to) })
            : t('nav.sections.overview')
        }
        title={firstName ? t(greetingKey(), { name: firstName }) : t('dashboard.title')}
        actions={
          canEdit && (
          <>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={newEmployeeModal.open}>
              {t('employees.new')}
            </Button>
            <Button leftSection={<IconPlus size={16} />} onClick={newMissionModal.open}>
              {t('missions.new')}
            </Button>
          </>
          )
        }
      />

      {dashboard.isPending ? (
        <Stack gap="xl">
          <Skeleton height={140} radius="md" maw={720} />
          <Skeleton height={220} radius="md" />
        </Stack>
      ) : dashboard.isError ? (
        <QueryError error={dashboard.error} onRetry={() => void dashboard.refetch()} />
      ) : (
        <DashboardContent data={dashboard.data} />
      )}

      <EmployeeFormModal opened={newEmployee} onClose={newEmployeeModal.close} />
      <MissionFormModal opened={newMission} onClose={newMissionModal.close} />
    </>
  );
}

function DashboardContent({ data }: { data: Dashboard }) {
  const { t } = useTranslation();
  const period = `from=${data.from}&to=${data.to}`;
  // Everyone's load over the same period, for the capacity chart (most available first).
  const team = useAvailability({ from: data.from, to: data.to, size: 100 });
  const people = team.data?.content ?? [];
  const averageLoad = people.length ? people.reduce((sum, person) => sum + person.peakOccupation, 0) / people.length : undefined;

  return (
    <>
      <div className={classes.hero}>
        <div className={classes.headline}>
          <Trans
            i18nKey="dashboard.headline.available"
            values={{ available: data.availableEmployees, total: data.activeEmployees, days: data.horizonDays }}
            components={{ mark: <Link to={`/availability?minAvailability=50&${period}`} className="sh-mark" /> }}
          />{' '}
          {data.overbookedEmployees > 0 ? (
            <Trans
              i18nKey="dashboard.headline.overbooked"
              count={data.overbookedEmployees}
              components={{ over: <Link to={`/availability?${period}`} className={classes.over} /> }}
            />
          ) : (
            <span className={classes.calm}>{t('dashboard.headline.nobodyOverbooked')}</span>
          )}
        </div>

        <div className={classes.figures}>
          <Figure value={averageLoad === undefined ? '—' : formatPercent(Math.round(averageLoad))} label={t('dashboard.figures.averageLoad')} to={`/availability?${period}`} />
          <Figure value={data.missionsByStatus.ONGOING ?? 0} label={t('dashboard.figures.ongoing')} to="/missions?status=ONGOING" />
          <Figure value={data.openNeedCount} label={t('dashboard.figures.openPositions')} to="/missions" />
          <Figure value={data.activeEmployees} label={t('dashboard.figures.employees')} to="/employees" />
        </div>
      </div>

      <Section
        title={t('dashboard.capacity.title')}
        description={t('dashboard.capacity.description', { days: data.horizonDays })}
        icon={<IconChartBar size={17} stroke={1.8} />}
        actions={<ViewAll to={`/availability?${period}`} label={t('dashboard.capacity.open')} />}
        sheet="padded"
      >
        {team.isPending ? (
          <Skeleton height={220} radius="md" />
        ) : team.isError ? (
          <QueryError error={team.error} onRetry={() => void team.refetch()} />
        ) : people.length === 0 ? (
          <EmptyState compact icon={<IconUsers size={22} stroke={1.5} />} title={t('dashboard.mostAvailable.empty')} />
        ) : (
          <CapacityBoard people={people} total={team.data?.page.totalElements ?? people.length} period={period} />
        )}
      </Section>

      <div className={classes.split}>
        <OpenPositions data={data} />

        <Stack gap={40} style={{ minWidth: 0 }}>
          <Section
            title={t('dashboard.missions.title')}
            description={t('dashboard.missions.description')}
            icon={<IconBriefcase size={17} stroke={1.8} />}
            actions={<ViewAll to="/missions" label={t('common.viewAll')} />}
            sheet="padded"
          >
            <Pipeline counts={data.missionsByStatus} />
          </Section>

          <Section
            title={t('dashboard.endingSoon.title')}
            description={t('dashboard.endingSoon.description')}
            icon={<IconCalendarDue size={17} stroke={1.8} />}
            sheet="padded"
          >
            {data.assignmentsEndingSoon.length === 0 ? (
              <EmptyState compact icon={<IconCalendarDue size={22} stroke={1.5} />} title={t('dashboard.endingSoon.empty')} />
            ) : (
              <div>
                {data.assignmentsEndingSoon.map((assignment) => {
                  const days = daysFromToday(assignment.endDate);
                  return (
                    <Link key={assignment.id} to={`/missions/${assignment.mission.id}`} className={classes.ending}>
                      <div className={classes.date}>
                        <div className={`${classes.dateDay} tabular-nums`}>{dayjs(assignment.endDate).format('D')}</div>
                        <div className="sh-label">{dayjs(assignment.endDate).format('MMM')}</div>
                      </div>
                      <div className={classes.rail}>
                        <span className={classes.railDot} data-soon={days <= 7 || undefined} />
                      </div>
                      <PersonCell
                        person={assignment.employee}
                        link={false}
                        secondary={`${assignment.mission.label} · ${assignment.mission.customer.label}`}
                      />
                      <Stack gap={2} align="flex-end">
                        <Text size="sm" fw={600} className="tabular-nums">
                          {formatPercent(assignment.rate ?? 100)}
                        </Text>
                        <Text size="xs" fw={600} c={days <= 7 ? 'var(--sh-primary-text)' : 'dimmed'}>
                          {days === 0 ? t('common.today') : t('common.inDays', { count: days })}
                        </Text>
                      </Stack>
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>
        </Stack>
      </div>
    </>
  );
}

function Figure({ value, label, to }: { value: number | string; label: string; to: string }) {
  return (
    <Link to={to} className={classes.figure}>
      <span className={`${classes.figureValue} tabular-nums`}>{value}</span>
      <Text size="sm" fw={550} c="var(--sh-text-2)">
        {label}
      </Text>
    </Link>
  );
}

function ViewAll({ to, label }: { to: string; label: string }) {
  return (
    <Button component={Link} to={to} size="xs" variant="subtle" color="brand" rightSection={<IconArrowUpRight size={14} />}>
      {label}
    </Button>
  );
}

const STAGES: MissionStatus[] = MISSION_STATUSES;

function Pipeline({ counts }: { counts: Partial<Record<MissionStatus, number>> }) {
  const { t } = useTranslation();
  const total = STAGES.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  if (total === 0) {
    return <EmptyState compact icon={<IconBriefcase size={22} stroke={1.5} />} title={t('dashboard.missions.empty')} />;
  }
  const max = Math.max(...STAGES.map((status) => counts[status] ?? 0), 1);
  return (
    <div>
      {STAGES.map((status, index) => {
        const count = counts[status] ?? 0;
        return (
          <Link key={status} to={`/missions?status=${status}`} className={classes.stage}>
            <span className="sh-label">{status === 'CANCELLED' ? '—' : String(index + 1).padStart(2, '0')}</span>
            <Text size="sm" fw={600}>
              {t(`enums.missionStatus.${status}`)}
            </Text>
            <div className={classes.stageTrack}>
              <div className={classes.stageBar} data-status={status} style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className={`${classes.stageCount} tabular-nums`}>{count}</span>
          </Link>
        );
      })}
    </div>
  );
}

/** Open positions on active missions, soonest first. */
function OpenPositions({ data }: { data: Dashboard }) {
  const { t } = useTranslation();
  return (
    <Section
      title={t('dashboard.openPositions.title')}
      description={t('dashboard.openPositions.description', { count: data.openNeedCount })}
      icon={<IconUserSearch size={17} stroke={1.8} />}
      sheet="padded"
    >
      {data.openNeeds.length === 0 ? (
        <EmptyState compact icon={<IconUserSearch size={22} stroke={1.5} />} title={t('dashboard.openPositions.empty')} />
      ) : (
        <div>
          {data.openNeeds.map(({ mission, need }) => {
            const days = need.startDate ? daysFromToday(need.startDate) : undefined;
            return (
              <Link key={need.id} to={`/missions/${mission.id}`} className={classes.position}>
                <span className={classes.positionSwatch} style={{ background: missionColor(mission.id) }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text size="sm" fw={650} truncate>
                    {needTitle(need, t)}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {mission.label} · {mission.customer.label}
                  </Text>
                </div>
                <Stack gap={0} align="flex-end">
                  <Text size="sm" fw={600} className="tabular-nums">
                    {formatPercent(need.rate ?? 100)}
                  </Text>
                  <Text size="xs" fw={600} c={days !== undefined && days <= 14 ? 'var(--sh-primary-text)' : 'dimmed'}>
                    {days === undefined
                      ? t('dashboard.openPositions.noDate')
                      : days <= 0
                        ? t('dashboard.openPositions.started')
                        : t('dashboard.openPositions.startsIn', { count: days })}
                  </Text>
                </Stack>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}
