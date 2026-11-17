import { ActionIcon, Anchor, Badge, Button, Grid, Group, Menu, Skeleton, Stack, Table, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBriefcase,
  IconChevronDown,
  IconExternalLink,
  IconMessage,
  IconPencil,
  IconPlus,
  IconStar,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '@/api/errors';
import { missionApi, useMission } from '@/api/hooks/missions';
import type { Mission, MissionAssignment, MissionStatus } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { BusinessUnitBadge, MissionStatusBadge, OverbookedBadge } from '@/components/badges';
import { confirmDelete } from '@/components/confirmDelete';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { DetailItem, SectionCard } from '@/components/SectionCard';
import { MISSION_STATUS_COLORS, MISSION_STATUSES } from '@/lib/enums';
import { formatDateTime, formatPercent, formatPeriod, fullName } from '@/lib/format';
import NotFoundPage from '@/pages/NotFoundPage';
import { AssignmentFormModal } from './AssignmentFormModal';
import { MissionFormModal } from './MissionFormModal';
import { toMissionRequest } from './missionRequest';
import { RequiredSkillsCard } from './RequiredSkillsCard';
import { SkillMatchSummary } from './SkillMatchSummary';

export default function MissionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const mission = useMission(id);
  const [editing, editModal] = useDisclosure();

  const remove = useApiMutation({
    mutationFn: missionApi.remove,
    successMessage: t('missions.deleted'),
    onSuccess: () => navigate('/missions'),
  });
  const changeStatus = useApiMutation({
    mutationFn: ({ mission: current, status }: { mission: Mission; status: MissionStatus }) =>
      missionApi.update({ id: current.id, body: { ...toMissionRequest(current), status } }),
    successMessage: (saved) => t('missions.statusChanged', { status: t(`enums.missionStatus.${saved.status}`) }),
  });

  if (mission.isPending) return <Skeleton height={480} radius="lg" />;
  if (mission.isError) {
    if (mission.error instanceof ApiError && mission.error.status === 404) return <NotFoundPage />;
    return <QueryError error={mission.error} onRetry={() => void mission.refetch()} />;
  }
  const data = mission.data;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: t('nav.missions'), to: '/missions' }]}
        leading={
          <ThemeIcon size={56} radius="lg" variant="light" color={MISSION_STATUS_COLORS[data.status]}>
            <IconBriefcase size={28} stroke={1.6} />
          </ThemeIcon>
        }
        title={data.label}
        description={`${data.customer.label} · ${data.projectName}`}
        meta={
          <Group gap={6}>
            <MissionStatusBadge value={data.status} size="md" />
            {data.businessUnit && <BusinessUnitBadge value={data.businessUnit} size="md" />}
          </Group>
        }
        actions={
          <>
            <Menu position="bottom-end">
              <Menu.Target>
                <Button variant="default" rightSection={<IconChevronDown size={14} />}>
                  {t('missions.changeStatus')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {MISSION_STATUSES.map((status) => (
                  <Menu.Item
                    key={status}
                    disabled={status === data.status}
                    leftSection={<Badge size="xs" circle color={MISSION_STATUS_COLORS[status]}> </Badge>}
                    onClick={() => changeStatus.mutate({ mission: data, status })}
                  >
                    {t(`enums.missionStatus.${status}`)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            <Button leftSection={<IconPencil size={16} />} onClick={editModal.open}>
              {t('common.edit')}
            </Button>
            <Tooltip label={t('common.delete')}>
              <ActionIcon
                size="lg"
                variant="default"
                color="red"
                aria-label={t('common.delete')}
                onClick={() =>
                  confirmDelete({
                    title: t('missions.deleteTitle'),
                    message: t('missions.deleteMessage', { label: data.label, count: data.assignments.length }),
                    onConfirm: () => remove.mutate(data.id),
                  })
                }
              >
                <IconTrash size={17} />
              </ActionIcon>
            </Tooltip>
          </>
        }
      />

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <TeamCard mission={data} />
            <RequiredSkillsCard mission={data} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <SectionCard title={t('missions.details')}>
            <Stack gap="md">
              <DetailItem label={t('missions.fields.customer')}>
                <Anchor component={Link} to={`/missions?customerId=${data.customer.id}`} size="sm">
                  {data.customer.label}
                </Anchor>
              </DetailItem>
              <DetailItem label={t('missions.fields.projectName')}>{data.projectName}</DetailItem>
              <DetailItem label={t('missions.fields.projectManager')}>
                {data.projectManager ? <PersonCell person={data.projectManager} size="sm" /> : <Text c="dimmed" size="sm" span>{t('missions.noProjectManager')}</Text>}
              </DetailItem>
              <DetailItem label={t('missions.fields.starUrl')}>
                {data.starUrl ? (
                  <Anchor href={data.starUrl} target="_blank" rel="noreferrer" size="sm">
                    <Group gap={4} wrap="nowrap" component="span" display="inline-flex">
                      {t('missions.openTicket')} <IconExternalLink size={14} />
                    </Group>
                  </Anchor>
                ) : (
                  <Text c="dimmed" size="sm" span>
                    —
                  </Text>
                )}
              </DetailItem>
              <DetailItem label={t('missions.fields.description')}>
                {data.description ? <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{data.description}</Text> : <Text c="dimmed" size="sm" span>—</Text>}
              </DetailItem>
              <DetailItem label={t('missions.fields.comment')}>
                {data.comment ? <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{data.comment}</Text> : <Text c="dimmed" size="sm" span>—</Text>}
              </DetailItem>
              <Text size="xs" c="dimmed">
                {t('common.createdOn', { date: formatDateTime(data.createdAt) })} · {t('common.updatedOn', { date: formatDateTime(data.updatedAt) })}
              </Text>
            </Stack>
          </SectionCard>
        </Grid.Col>
      </Grid>

      <MissionFormModal opened={editing} onClose={editModal.close} mission={data} />
    </>
  );
}

function TeamCard({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const [assignmentModal, assignmentModalHandlers] = useDisclosure();
  const [editing, setEditing] = useState<MissionAssignment>();
  const remove = useApiMutation({ mutationFn: missionApi.removeAssignment, successMessage: t('missions.assignments.removed') });

  const people = new Set(mission.assignments.map((assignment) => assignment.employee.id)).size;
  const openCreate = () => {
    setEditing(undefined);
    assignmentModalHandlers.open();
  };

  return (
    <SectionCard
      title={t('missions.team.title')}
      description={t('missions.team.description', { count: people })}
      actions={
        <Button size="xs" leftSection={<IconUserPlus size={14} />} onClick={openCreate}>
          {t('missions.assignments.assign')}
        </Button>
      }
      flush
    >
      {mission.assignments.length === 0 ? (
        <EmptyState
          compact
          icon={<IconUserPlus size={22} />}
          title={t('missions.team.emptyTitle')}
          description={t('missions.team.emptyDescription')}
          action={
            <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={openCreate}>
              {t('missions.assignments.assign')}
            </Button>
          }
        />
      ) : (
        <Table.ScrollContainer minWidth={760}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('missions.assignments.employee')}</Table.Th>
                <Table.Th>{t('missions.assignments.period')}</Table.Th>
                <Table.Th ta="right">{t('missions.assignments.rate')}</Table.Th>
                <Table.Th>{t('missions.assignments.skills')}</Table.Th>
                <Table.Th w={1} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mission.assignments.map((assignment) => (
                <Table.Tr key={assignment.id}>
                  <Table.Td>
                    <PersonCell person={assignment.employee} secondary={<AssignmentNotes assignment={assignment} />} />
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
                      <Text size="sm" fw={500} className="tabular-nums">
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
                      <Text size="sm" c="dimmed">
                        —
                      </Text>
                    ) : (
                      <SkillMatchSummary matches={assignment.skillMatches} />
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label={t('common.edit')}>
                        <ActionIcon
                          aria-label={t('common.edit')}
                          onClick={() => {
                            setEditing(assignment);
                            assignmentModalHandlers.open();
                          }}
                        >
                          <IconPencil size={17} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t('common.remove')}>
                        <ActionIcon
                          color="red"
                          aria-label={t('common.remove')}
                          onClick={() =>
                            confirmDelete({
                              title: t('missions.assignments.removeTitle'),
                              message: t('missions.assignments.removeMessage', { name: fullName(assignment.employee), mission: mission.label }),
                              confirmLabel: t('common.remove'),
                              onConfirm: () => remove.mutate({ id: mission.id, assignmentId: assignment.id }),
                            })
                          }
                        >
                          <IconTrash size={17} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
      <AssignmentFormModal mission={mission} assignment={editing} opened={assignmentModal} onClose={assignmentModalHandlers.close} />
    </SectionCard>
  );
}

/** Small icons for the appreciation and comment, with the text in a tooltip. */
function AssignmentNotes({ assignment }: { assignment: MissionAssignment }) {
  const { t } = useTranslation();
  if (!assignment.appreciation && !assignment.comment) return null;
  return (
    <Group gap={6} wrap="nowrap" component="span">
      {assignment.appreciation && (
        <Tooltip label={assignment.appreciation} multiline maw={320}>
          <Group gap={2} component="span" wrap="nowrap" c="yellow.7">
            <IconStar size={12} /> {t('missions.assignments.appreciation')}
          </Group>
        </Tooltip>
      )}
      {assignment.comment && (
        <Tooltip label={assignment.comment} multiline maw={320}>
          <Group gap={2} component="span" wrap="nowrap">
            <IconMessage size={12} /> {t('missions.fields.comment')}
          </Group>
        </Tooltip>
      )}
    </Group>
  );
}

