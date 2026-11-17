import { Badge, Button, Card, Grid, Group, RingProgress, SimpleGrid, Skeleton, Stack, Table, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBriefcase,
  IconCalendarDue,
  IconMoodSmile,
  IconPlus,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { useDashboard } from '@/api/hooks/dashboard';
import type { MissionStatus } from '@/api/types';
import { useSession } from '@/auth/session';
import { MissionStatusBadge } from '@/components/badges';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { AvailabilityMeter } from '@/components/OccupationBar';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { SectionCard } from '@/components/SectionCard';
import { MISSION_STATUS_COLORS, MISSION_STATUSES } from '@/lib/enums';
import { daysFromToday, formatDate, formatPercent, formatShortDate } from '@/lib/format';
import { EmployeeFormModal } from '../employees/EmployeeFormModal';
import { MissionFormModal } from '../missions/MissionFormModal';

function greetingKey(): 'dashboard.greeting.morning' | 'dashboard.greeting.afternoon' | 'dashboard.greeting.evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting.morning';
  if (hour < 18) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSession();
  const dashboard = useDashboard();
  const [newEmployee, newEmployeeModal] = useDisclosure();
  const [newMission, newMissionModal] = useDisclosure();
  const firstName = session.userName?.split(/\s+/)[0];

  return (
    <>
      <PageHeader
        title={firstName ? t(greetingKey(), { name: firstName }) : t('dashboard.title')}
        description={
          dashboard.data
            ? t('dashboard.description', { from: formatDate(dashboard.data.from), to: formatDate(dashboard.data.to) })
            : t('dashboard.descriptionLoading')
        }
        actions={
          <>
            <Button variant="default" leftSection={<IconPlus size={16} />} onClick={newEmployeeModal.open}>
              {t('employees.new')}
            </Button>
            <Button leftSection={<IconPlus size={16} />} onClick={newMissionModal.open}>
              {t('missions.new')}
            </Button>
          </>
        }
      />

      {dashboard.isPending ? (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }}>
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} height={112} radius="lg" />
            ))}
          </SimpleGrid>
          <Skeleton height={320} radius="lg" />
        </Stack>
      ) : dashboard.isError ? (
        <QueryError error={dashboard.error} onRetry={() => void dashboard.refetch()} />
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg">
            <StatCard
              label={t('dashboard.stats.activeEmployees')}
              value={dashboard.data.activeEmployees}
              icon={<IconUsers size={22} />}
              color="brand"
              to="/employees"
            />
            <StatCard
              label={t('dashboard.stats.available')}
              value={dashboard.data.availableEmployees}
              hint={t('dashboard.stats.availableHint')}
              icon={<IconUserCheck size={22} />}
              color="teal"
              to={`/availability?minAvailability=50&from=${dashboard.data.from}&to=${dashboard.data.to}`}
              ring={dashboard.data.activeEmployees ? (dashboard.data.availableEmployees / dashboard.data.activeEmployees) * 100 : 0}
            />
            <StatCard
              label={t('dashboard.stats.overbooked')}
              value={dashboard.data.overbookedEmployees}
              hint={t('dashboard.stats.overbookedHint')}
              icon={<IconAlertTriangle size={22} />}
              color={dashboard.data.overbookedEmployees > 0 ? 'red' : 'gray'}
              to={`/availability?from=${dashboard.data.from}&to=${dashboard.data.to}`}
            />
            <StatCard
              label={t('dashboard.stats.ongoingMissions')}
              value={dashboard.data.missionsByStatus.ONGOING ?? 0}
              icon={<IconBriefcase size={22} />}
              color="grape"
              to="/missions?status=ONGOING"
            />
          </SimpleGrid>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SectionCard
                title={t('dashboard.mostAvailable.title')}
                description={t('dashboard.mostAvailable.description')}
                actions={<ViewAll to={`/availability?from=${dashboard.data.from}&to=${dashboard.data.to}`} />}
              >
                {dashboard.data.mostAvailable.length === 0 ? (
                  <EmptyState compact icon={<IconUsers size={22} />} title={t('dashboard.mostAvailable.empty')} />
                ) : (
                  <Stack gap="md">
                    {dashboard.data.mostAvailable.map((employee) => (
                      <Group key={employee.id} justify="space-between" wrap="nowrap">
                        <PersonCell person={employee} secondary={t(`enums.seniority.${employee.seniority}`)} />
                        <AvailabilityMeter occupation={employee.peakOccupation} availability={employee.availability} compact />
                      </Group>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SectionCard title={t('dashboard.missions.title')} description={t('dashboard.missions.description')} actions={<ViewAll to="/missions" />}>
                <MissionsByStatus counts={dashboard.data.missionsByStatus} />
              </SectionCard>
            </Grid.Col>
          </Grid>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <SectionCard
                title={t('dashboard.endingSoon.title')}
                description={t('dashboard.endingSoon.description')}
                icon={<IconCalendarDue size={18} stroke={1.6} />}
                flush
              >
                {dashboard.data.assignmentsEndingSoon.length === 0 ? (
                  <EmptyState compact icon={<IconCalendarDue size={22} />} title={t('dashboard.endingSoon.empty')} />
                ) : (
                  <Table.ScrollContainer minWidth={520}>
                    <Table>
                      <Table.Tbody>
                        {dashboard.data.assignmentsEndingSoon.map((assignment) => {
                          const days = daysFromToday(assignment.endDate);
                          return (
                            <Table.Tr key={assignment.id} className="clickable-row" onClick={() => navigate(`/missions/${assignment.mission.id}`)}>
                              <Table.Td>
                                <PersonCell person={assignment.employee} secondary={`${assignment.mission.label} · ${assignment.mission.customer.label}`} />
                              </Table.Td>
                              <Table.Td ta="right">
                                <Text size="sm">{formatShortDate(assignment.endDate)}</Text>
                                <Badge size="xs" color={days <= 7 ? 'orange' : 'gray'} variant="light">
                                  {days === 0 ? t('common.today') : t('common.inDays', { count: days })}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                )}
              </SectionCard>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <SectionCard
                title={t('dashboard.overbooked.title')}
                description={t('dashboard.overbooked.description')}
                icon={<IconAlertTriangle size={18} stroke={1.6} color="var(--mantine-color-red-6)" />}
              >
                {dashboard.data.overbooked.length === 0 ? (
                  <EmptyState compact icon={<IconMoodSmile size={22} />} title={t('dashboard.overbooked.empty')} description={t('dashboard.overbooked.emptyDescription')} />
                ) : (
                  <Stack gap="md">
                    {dashboard.data.overbooked.map((employee) => (
                      <Group key={employee.id} justify="space-between" wrap="nowrap">
                        <PersonCell
                          person={employee}
                          secondary={t('dashboard.overbooked.missionCount', { count: employee.assignments.length })}
                        />
                        <Badge color="red" variant="light" className="tabular-nums">
                          {t('dashboard.overbooked.peak', { value: formatPercent(employee.peakOccupation) })}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            </Grid.Col>
          </Grid>
        </Stack>
      )}

      <EmployeeFormModal opened={newEmployee} onClose={newEmployeeModal.close} />
      <MissionFormModal opened={newMission} onClose={newMissionModal.close} />
    </>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: ReactNode;
  color: string;
  to: string;
  ring?: number;
}

function StatCard({ label, value, hint, icon, color, to, ring }: StatCardProps) {
  return (
    <UnstyledButton component={Link} to={to} style={{ display: 'block' }}>
      <Card h="100%" style={{ transition: 'transform 120ms ease, box-shadow 120ms ease' }} className="stat-card">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
              {label}
            </Text>
            <Text fz={32} fw={700} lh={1.2} mt={6} className="tabular-nums">
              {value}
            </Text>
            {hint && (
              <Text size="xs" c="dimmed" mt={2}>
                {hint}
              </Text>
            )}
          </div>
          {ring !== undefined ? (
            <RingProgress
              size={64}
              thickness={7}
              roundCaps
              sections={[{ value: ring, color }]}
              label={<Group justify="center" c={color}>{icon}</Group>}
            />
          ) : (
            <ThemeIcon size={48} radius="md" variant="light" color={color}>
              {icon}
            </ThemeIcon>
          )}
        </Group>
      </Card>
    </UnstyledButton>
  );
}

function ViewAll({ to }: { to: string }) {
  const { t } = useTranslation();
  return (
    <Button component={Link} to={to} size="xs" variant="subtle" rightSection={<IconArrowRight size={14} />}>
      {t('common.viewAll')}
    </Button>
  );
}

function MissionsByStatus({ counts }: { counts: Partial<Record<MissionStatus, number>> }) {
  const { t } = useTranslation();
  const total = MISSION_STATUSES.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  if (total === 0) {
    return <EmptyState compact icon={<IconBriefcase size={22} />} title={t('dashboard.missions.empty')} />;
  }
  const data = MISSION_STATUSES.filter((status) => (counts[status] ?? 0) > 0).map((status) => ({
    name: t(`enums.missionStatus.${status}`),
    value: counts[status] ?? 0,
    color: `${MISSION_STATUS_COLORS[status]}.6`,
  }));
  return (
    <Group justify="space-around" wrap="wrap" gap="lg">
      <DonutChart data={data} size={170} thickness={24} withTooltip tooltipDataSource="segment" chartLabel={total} paddingAngle={2} />
      <Stack gap={8} miw={180}>
        {MISSION_STATUSES.map((status) => (
          <UnstyledButton key={status} component={Link} to={`/missions?status=${status}`}>
            <Group justify="space-between" gap="lg">
              <MissionStatusBadge value={status} />
              <Text size="sm" fw={600} className="tabular-nums">
                {counts[status] ?? 0}
              </Text>
            </Group>
          </UnstyledButton>
        ))}
      </Stack>
    </Group>
  );
}
