import { ActionIcon, Anchor, Button, Group, Skeleton, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconExternalLink, IconMessage, IconPencil, IconPlus, IconStar, IconTrash, IconInfoCircle, IconUserPlus, IconUsersGroup, IconX } from '@tabler/icons-react';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '@/api/errors';
import { missionApi, useMission, useMoveAssignment } from '@/api/hooks/missions';
import type { Mission, MissionAssignment, MissionStatus } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { BusinessUnitBadge, MissionStatusBadge, OverbookedBadge } from '@/components/badges';
import { confirmDelete } from '@/components/confirmDelete';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { DetailItem, Section } from '@/components/Section';
import { TimelineAxis, TimelineTrack, type TimelineBar } from '@/components/Timeline';
import { formatDateTime, formatPercent, formatPeriod, formatShortDate, fullName } from '@/lib/format';
import { missionColor, rangeAround } from '@/lib/timeline';
import NotFoundPage from '@/pages/NotFoundPage';
import { AssignmentFormModal } from './AssignmentFormModal';
import classes from './MissionDetailPage.module.css';
import { MissionFormModal } from './MissionFormModal';
import { MissionNeeds } from './MissionNeeds';
import { toMissionRequest } from './missionRequest';
import { RequiredSkillsCard } from './RequiredSkillsCard';

/** The usual life of a mission, in order. Cancelled is offered separately. */
const STEPS: MissionStatus[] = ['PROSPECT', 'CONFIRMED', 'ONGOING', 'COMPLETED'];

export default function MissionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const mission = useMission(id);
  const { canEdit } = usePermissions();
  const [editing, editModal] = useDisclosure();

  const remove = useApiMutation({
    mutationFn: missionApi.remove,
    successMessage: t('missions.deleted'),
    onSuccess: () => navigate('/missions'),
  });

  if (mission.isPending) {
    return (
      <Stack gap="xl">
        <Skeleton height={48} width={420} />
        <Skeleton height={56} />
        <Skeleton height={360} radius="md" />
      </Stack>
    );
  }
  if (mission.isError) {
    if (mission.error instanceof ApiError && mission.error.status === 404) return <NotFoundPage />;
    return <QueryError error={mission.error} onRetry={() => void mission.refetch()} />;
  }
  const data = mission.data;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: t('nav.missions'), to: '/missions' },
          { label: data.customer.label, to: `/missions?customerId=${data.customer.id}` },
        ]}
        title={data.label}
        description={data.projectName}
        meta={
          <Group gap={8}>
            <MissionStatusBadge value={data.status} size="md" />
            {data.businessUnit && <BusinessUnitBadge value={data.businessUnit} size="md" />}
          </Group>
        }
        actions={
          canEdit && (
          <>
            <Button leftSection={<IconPencil size={16} />} onClick={editModal.open}>
              {t('common.edit')}
            </Button>
            <Tooltip label={t('common.delete')}>
              <ActionIcon
                size={36}
                variant="default"
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
          )
        }
      />

      <StatusTrack mission={data} />

      <div className={classes.layout}>
        <Stack gap={40} style={{ minWidth: 0 }}>
          <TeamSection mission={data} />
          <MissionNeeds mission={data} />
          <RequiredSkillsCard mission={data} />
        </Stack>

        <aside>
          <Section title={t('missions.details')} icon={<IconInfoCircle size={17} stroke={1.8} />} sheet="padded">
            <DetailItem label={t('missions.fields.customer')}>
              <Anchor component={Link} to={`/missions?customerId=${data.customer.id}`} size="sm" fw={600}>
                {data.customer.label}
              </Anchor>
            </DetailItem>
            <DetailItem label={t('missions.fields.projectName')}>{data.projectName}</DetailItem>
            <DetailItem label={t('missions.fields.projectManager')}>
              {data.projectManager ? (
                <PersonCell person={data.projectManager} size="sm" />
              ) : (
                <Text c="dimmed" size="sm" span>
                  {t('missions.noProjectManager')}
                </Text>
              )}
            </DetailItem>
            <DetailItem label={t('missions.fields.starUrl')}>
              {data.starUrl ? (
                <Anchor href={data.starUrl} target="_blank" rel="noreferrer" size="sm" fw={600}>
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
              {data.description ? (
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {data.description}
                </Text>
              ) : (
                <Text c="dimmed" size="sm" span>
                  —
                </Text>
              )}
            </DetailItem>
            <DetailItem label={t('missions.fields.comment')}>
              {data.comment ? (
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {data.comment}
                </Text>
              ) : (
                <Text c="dimmed" size="sm" span>
                  —
                </Text>
              )}
            </DetailItem>
            <Text size="xs" c="dimmed" mt="lg">
              {t('common.createdOn', { date: formatDateTime(data.createdAt) })} · {t('common.updatedOn', { date: formatDateTime(data.updatedAt) })}
            </Text>
          </Section>
        </aside>
      </div>

      <MissionFormModal opened={editing} onClose={editModal.close} mission={data} />
    </>
  );
}

/** The mission's life as clickable steps: click one to move the mission to that status. */
function StatusTrack({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const changeStatus = useApiMutation({
    mutationFn: ({ status }: { status: MissionStatus }) =>
      missionApi.update({ id: mission.id, body: { ...toMissionRequest(mission), status } }),
    successMessage: (saved) => t('missions.statusChanged', { status: t(`enums.missionStatus.${saved.status}`) }),
  });
  const cancelled = mission.status === 'CANCELLED';
  const currentIndex = STEPS.indexOf(mission.status);
  const set = (status: MissionStatus) => {
    if (canEdit && status !== mission.status && !changeStatus.isPending) changeStatus.mutate({ status });
  };

  return (
    <div className={classes.statusTrack} data-cancelled={cancelled || undefined} role="group" aria-label={t('missions.changeStatus')}>
      <ol className={classes.steps}>
        {STEPS.map((status, index) => {
          const state = cancelled ? 'idle' : index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo';
          return (
            <Fragment key={status}>
              {index > 0 && <li className={classes.connector} data-done={(!cancelled && index <= currentIndex) || undefined} aria-hidden="true" />}
              <li>
                <Tooltip
                  disabled={!canEdit}
                  label={state === 'current' ? t('missions.status.current') : t('missions.status.moveTo', { status: t(`enums.missionStatus.${status}`) })}
                >
                  <UnstyledButton
                    className={classes.step}
                    data-state={state}
                    data-readonly={!canEdit || undefined}
                    aria-current={state === 'current' ? 'step' : undefined}
                    onClick={() => set(status)}
                  >
                    <span className={classes.stepDot}>{state === 'done' ? <IconCheck size={13} stroke={3} /> : index + 1}</span>
                    {t(`enums.missionStatus.${status}`)}
                  </UnstyledButton>
                </Tooltip>
              </li>
            </Fragment>
          );
        })}
      </ol>
      {canEdit && (
        <UnstyledButton className={classes.cancel} data-active={cancelled || undefined} onClick={() => set(cancelled ? 'PROSPECT' : 'CANCELLED')}>
          <IconX size={14} stroke={2.2} />
          {cancelled ? t('missions.status.reopen') : t('missions.status.cancel')}
        </UnstyledButton>
      )}
    </div>
  );
}

function TeamSection({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const moveAssignment = useMoveAssignment();
  const [assignmentModal, assignmentModalHandlers] = useDisclosure();
  const [editing, setEditing] = useState<MissionAssignment>();
  const remove = useApiMutation({ mutationFn: missionApi.removeAssignment, successMessage: t('missions.assignments.removed') });

  const people = new Set(mission.assignments.map((assignment) => assignment.employee.id)).size;
  const bars = useMemo(
    () =>
      new Map<string, TimelineBar>(
        mission.assignments.map((assignment) => [
          assignment.id,
          {
            id: assignment.id,
            start: assignment.startDate,
            end: assignment.endDate,
            rate: assignment.rate,
            label: assignment.startDate
              ? `${formatShortDate(assignment.startDate)} → ${assignment.endDate ? formatShortDate(assignment.endDate) : '…'}`
              : fullName(assignment.employee),
            color: missionColor(mission.id),
            editable: canEdit,
            detail: `${fullName(assignment.employee)} · ${formatPeriod(assignment.startDate, assignment.endDate)}`,
          },
        ]),
      ),
    [mission, canEdit],
  );
  const range = useMemo(() => rangeAround([...bars.values()]), [bars]);

  const openCreate = () => {
    setEditing(undefined);
    assignmentModalHandlers.open();
  };

  return (
    <Section
      title={t('missions.team.title')}
      description={t('missions.team.description', { count: people })}
      icon={<IconUsersGroup size={17} stroke={1.8} />}
      sheet="padded"
      actions={
        canEdit && (
          <Button size="xs" leftSection={<IconUserPlus size={14} />} onClick={openCreate}>
            {t('missions.assignments.assign')}
          </Button>
        )
      }
    >
      {mission.assignments.length === 0 ? (
        <EmptyState
          compact
          icon={<IconUserPlus size={22} stroke={1.5} />}
          title={t('missions.team.emptyTitle')}
          description={t('missions.team.emptyDescription')}
          action={
            canEdit && (
              <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={openCreate}>
                {t('missions.assignments.assign')}
              </Button>
            )
          }
        />
      ) : (
        <div className={classes.team}>
          <div className={classes.teamHead}>
            <Text className="sh-label" pb={8}>
              {t('missions.assignments.employee')}
            </Text>
            <TimelineAxis range={range} />
            <Text className="sh-label" pb={8} ta="right">
              {t('missions.assignments.rate')}
            </Text>
          </div>
          {mission.assignments.map((assignment) => (
            <div key={assignment.id} className={classes.teamRow}>
              <div className={classes.teamPerson}>
                <PersonCell person={assignment.employee} secondary={<AssignmentNotes assignment={assignment} />} />
              </div>
              <div className={classes.teamTrack}>
                <TimelineTrack
                  range={range}
                  bars={[bars.get(assignment.id)!]}
                  showUnscheduled
                  onBarMove={(_, change) =>
                    moveAssignment.mutateAsync({
                      id: mission.id,
                      assignmentId: assignment.id,
                      body: { startDate: change.start, endDate: change.end ?? undefined, version: assignment.version },
                    })
                  }
                />
              </div>
              <Group gap={6} wrap="nowrap" justify="flex-end" className={classes.teamRate}>
                <Stack gap={2} align="flex-end">
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
                  {assignment.duration != null && (
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                      {t('missions.assignments.daysWorked', { count: assignment.duration })}
                    </Text>
                  )}
                </Stack>
                {canEdit && (
                <Group gap={0} wrap="nowrap" className={classes.rowActions}>
                  <Tooltip label={t('common.edit')}>
                    <ActionIcon
                      aria-label={t('common.edit')}
                      onClick={() => {
                        setEditing(assignment);
                        assignmentModalHandlers.open();
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t('common.remove')}>
                    <ActionIcon
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
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                )}
              </Group>
            </div>
          ))}
        </div>
      )}
      <AssignmentFormModal mission={mission} assignment={editing} opened={assignmentModal} onClose={assignmentModalHandlers.close} />
    </Section>
  );
}

/** Small icons for the appreciation and comment, with the text in a tooltip. */
function AssignmentNotes({ assignment }: { assignment: MissionAssignment }) {
  const { t } = useTranslation();
  if (!assignment.appreciation && !assignment.comment) return null;
  return (
    <Group gap={8} wrap="nowrap" component="span">
      {assignment.appreciation && (
        <Tooltip label={assignment.appreciation} multiline maw={320}>
          <Group gap={3} component="span" wrap="nowrap" c="var(--sh-partial)">
            <IconStar size={12} /> {t('missions.assignments.appreciation')}
          </Group>
        </Tooltip>
      )}
      {assignment.comment && (
        <Tooltip label={assignment.comment} multiline maw={320}>
          <Group gap={3} component="span" wrap="nowrap">
            <IconMessage size={12} /> {t('missions.fields.comment')}
          </Group>
        </Tooltip>
      )}
    </Group>
  );
}
