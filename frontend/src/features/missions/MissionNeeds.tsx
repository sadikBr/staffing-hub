import { ActionIcon, Button, Drawer, Group, Modal, NumberInput, Select, SimpleGrid, Skeleton, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarEvent, IconCheck, IconPencil, IconPlus, IconTrash, IconUserCheck, IconUserSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { missionApi, useNeedCandidates } from '@/api/hooks/missions';
import { useRoles } from '@/api/hooks/reference';
import type { Mission, MissionNeed, NeedCandidate, Seniority } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { DaysOff, SeniorityBadge, Tag } from '@/components/badges';
import { confirmDelete } from '@/components/confirmDelete';
import { EmployeeAvatar } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { AvailabilityMeter } from '@/components/OccupationBar';
import { QueryError } from '@/components/QueryError';
import { Section } from '@/components/Section';
import { SENIORITIES } from '@/lib/enums';
import { formatPercent, formatPeriod, fullName } from '@/lib/format';
import classes from './MissionNeeds.module.css';
import { needTitle } from './needTitle';
import { SkillMatchList } from './SkillMatchSummary';

/** The mission's open positions, and who filled the others. */
export function MissionNeeds({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const [modalOpened, modal] = useDisclosure();
  const [editing, setEditing] = useState<MissionNeed>();
  const [searching, setSearching] = useState<MissionNeed>();
  const remove = useApiMutation({ mutationFn: missionApi.removeNeed, successMessage: t('needs.deleted') });

  const open = mission.needs.filter((need) => !need.filledBy).length;
  const openCreate = () => {
    setEditing(undefined);
    modal.open();
  };

  return (
    <Section
      title={t('needs.title')}
      description={mission.needs.length === 0 ? t('needs.description') : t('needs.summary', { open, filled: mission.needs.length - open })}
      icon={<IconUserSearch size={17} stroke={1.8} />}
      sheet="padded"
      actions={
        canEdit && (
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={openCreate}>
            {t('needs.add')}
          </Button>
        )
      }
    >
      {mission.needs.length === 0 ? (
        <EmptyState compact icon={<IconUserSearch size={22} stroke={1.5} />} title={t('needs.emptyTitle')} description={t('needs.emptyDescription')} />
      ) : (
        <div className={classes.list}>
          {mission.needs.map((need) => (
            <div key={need.id} className={classes.need} data-filled={Boolean(need.filledBy) || undefined}>
              <div className={classes.needInfo}>
                <Group gap={8} wrap="nowrap">
                  <Text fw={650} truncate>
                    {needTitle(need, t)}
                  </Text>
                  <Tag size="xs">{formatPercent(need.rate ?? 100)}</Tag>
                </Group>
                <Group gap={6} mt={2} wrap="nowrap" c="dimmed">
                  <IconCalendarEvent size={13} />
                  <Text size="xs" truncate>
                    {formatPeriod(need.startDate, need.endDate)}
                    {need.comment ? ` · ${need.comment}` : ''}
                  </Text>
                </Group>
              </div>
              {need.filledBy ? (
                <Link to={`/employees/${need.filledBy.employee.id}`} className={classes.filled}>
                  <IconCheck size={14} stroke={2.6} />
                  <EmployeeAvatar person={need.filledBy.employee} size={22} />
                  <Text size="sm" fw={600}>
                    {fullName(need.filledBy.employee)}
                  </Text>
                </Link>
              ) : (
                <Button size="xs" leftSection={<IconUserSearch size={14} />} onClick={() => setSearching(need)}>
                  {t('needs.findCandidates')}
                </Button>
              )}
              {canEdit && (
                <Group gap={0} wrap="nowrap" className={classes.actions}>
                  <Tooltip label={t('common.edit')}>
                    <ActionIcon
                      aria-label={t('common.edit')}
                      onClick={() => {
                        setEditing(need);
                        modal.open();
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t('common.delete')}>
                    <ActionIcon
                      aria-label={t('common.delete')}
                      onClick={() =>
                        confirmDelete({
                          title: t('needs.deleteTitle'),
                          message: need.filledBy ? t('needs.deleteFilledMessage') : t('needs.deleteMessage'),
                          onConfirm: () => remove.mutate({ id: mission.id, needId: need.id }),
                        })
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            </div>
          ))}
        </div>
      )}
      <NeedModal mission={mission} need={editing} opened={modalOpened} onClose={modal.close} />
      <CandidatesDrawer mission={mission} need={searching} onClose={() => setSearching(undefined)} />
    </Section>
  );
}

function NeedModal({ mission, need, opened, onClose }: { mission: Mission; need?: MissionNeed; opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const roles = useRoles();
  const [roleId, setRoleId] = useState<string | null>(null);
  const [seniority, setSeniority] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [rate, setRate] = useState<number | string>(100);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!opened) return;
    setRoleId(need?.role?.id ?? null);
    setSeniority(need?.seniority ?? null);
    setStartDate(need?.startDate ?? null);
    setEndDate(need?.endDate ?? null);
    setRate(need?.rate ?? 100);
    setComment(need?.comment ?? '');
  }, [opened, need]);

  const invalidPeriod = Boolean(startDate && endDate && endDate < startDate);
  const save = useApiMutation({
    mutationFn: () => {
      const body = {
        roleId: roleId ?? undefined,
        seniority: (seniority as Seniority | null) ?? undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        rate: typeof rate === 'number' ? rate : undefined,
        comment: comment.trim() || undefined,
        version: need?.version,
      };
      return need ? missionApi.updateNeed({ id: mission.id, needId: need.id, body }) : missionApi.createNeed({ id: mission.id, body });
    },
    successMessage: need ? t('needs.updated') : t('needs.created'),
    onSuccess: onClose,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={need ? t('needs.editTitle') : t('needs.createTitle')}>
      <Stack>
        <SimpleGrid cols={2}>
          <Select
            label={t('needs.role')}
            placeholder={t('needs.anyRole')}
            data={(roles.data ?? []).map((role) => ({ value: role.id, label: role.label }))}
            value={roleId}
            onChange={setRoleId}
            clearable
            searchable
            data-autofocus
          />
          <Select
            label={t('employees.fields.seniority')}
            placeholder={t('needs.anySeniority')}
            data={SENIORITIES.map((value) => ({ value, label: t(`enums.seniority.${value}`) }))}
            value={seniority}
            onChange={setSeniority}
            clearable
          />
          <DateInput label={t('missions.assignments.startDate')} placeholder={t('common.optional')} value={startDate} onChange={setStartDate} clearable valueFormat="D MMM YYYY" />
          <DateInput
            label={t('missions.assignments.endDate')}
            placeholder={t('missions.assignments.ongoing')}
            value={endDate}
            onChange={setEndDate}
            clearable
            valueFormat="D MMM YYYY"
            minDate={startDate ?? undefined}
            error={invalidPeriod ? t('missions.assignments.endBeforeStart') : undefined}
          />
          <NumberInput
            label={t('missions.assignments.rate')}
            description={t('missions.assignments.rateHelp')}
            value={rate}
            onChange={setRate}
            min={1}
            max={100}
            suffix="%"
          />
        </SimpleGrid>
        <Textarea label={t('missions.fields.comment')} placeholder={t('needs.commentPlaceholder')} value={comment} onChange={(event) => setComment(event.currentTarget.value)} autosize minRows={2} />
        <Text size="xs" c="dimmed">
          {t('needs.skillsHint')}
        </Text>
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={invalidPeriod} loading={save.isPending} onClick={() => save.mutate()}>
            {t('common.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/** The best candidates for a need, with why they fit; one click assigns them. */
function CandidatesDrawer({ mission, need, onClose }: { mission: Mission; need?: MissionNeed; onClose: () => void }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const candidates = useNeedCandidates(mission.id, need?.id);
  const fill = useApiMutation({
    mutationFn: ({ employeeId }: { employeeId: string; name: string }) => missionApi.fillNeed({ id: mission.id, needId: need!.id, employeeId }),
    successMessage: (_, { name }) => t('needs.filled', { name }),
    onSuccess: onClose,
  });

  return (
    <Drawer
      opened={Boolean(need)}
      onClose={onClose}
      position="right"
      size={560}
      title={
        need && (
          <div>
            <Text className="sh-serif" fz={22} fw={420} lh={1.15}>
              {t('needs.candidatesFor', { need: needTitle(need, t) })}
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              {formatPeriod(need.startDate, need.endDate)} · {formatPercent(need.rate ?? 100)}
            </Text>
          </div>
        )
      }
    >
      <Text size="xs" c="dimmed" mb="md">
        {t('needs.scoreExplained')}
      </Text>
      {candidates.isPending ? (
        <Stack>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} height={84} radius="md" />
          ))}
        </Stack>
      ) : candidates.isError ? (
        <QueryError error={candidates.error} onRetry={() => void candidates.refetch()} />
      ) : (
        <Stack gap={8}>
          {candidates.data.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              best={index === 0}
              canAssign={canEdit}
              assigning={fill.isPending && fill.variables?.employeeId === candidate.id}
              onAssign={() => fill.mutate({ employeeId: candidate.id, name: fullName(candidate) })}
            />
          ))}
        </Stack>
      )}
    </Drawer>
  );
}

function CandidateCard({
  candidate,
  best,
  canAssign,
  assigning,
  onAssign,
}: {
  candidate: NeedCandidate;
  best: boolean;
  canAssign: boolean;
  assigning: boolean;
  onAssign: () => void;
}) {
  const { t } = useTranslation();
  const met = candidate.skillMatches.filter((match) => match.meetsRequirement).length;
  return (
    <div className={classes.candidate} data-best={best || undefined}>
      <div className={classes.score} style={{ '--score': candidate.score } as React.CSSProperties} aria-label={t('needs.score', { score: candidate.score })}>
        <span>{candidate.score}</span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Group gap={8} wrap="nowrap" justify="space-between">
          <Link to={`/employees/${candidate.id}`} className={classes.name}>
            <EmployeeAvatar person={candidate} size={26} />
            <Text fw={650} truncate>
              {fullName(candidate)}
            </Text>
          </Link>
          {canAssign && (
            <Button size="compact-sm" variant={best ? 'filled' : 'light'} leftSection={<IconUserCheck size={14} />} loading={assigning} onClick={onAssign}>
              {t('needs.assign')}
            </Button>
          )}
        </Group>
        <Group gap={6} mt={8} wrap="wrap">
          <SeniorityBadge value={candidate.seniority} size="xs" />
          <Tag size="xs" className={candidate.roleMatch ? classes.yes : classes.no}>
            {candidate.roleMatch ? t('needs.roleMatch') : t('needs.roleMissing')}
          </Tag>
          {candidate.skillMatches.length > 0 && (
            <Tooltip label={<SkillMatchList matches={candidate.skillMatches} />} multiline w={300}>
              <span>
                <Tag size="xs" className={met === candidate.skillMatches.length ? classes.yes : met === 0 ? classes.no : undefined}>
                  {t('missions.skillMatch.summary', { met, total: candidate.skillMatches.length })}
                </Tag>
              </span>
            </Tooltip>
          )}
          {candidate.absentDays > 0 && <DaysOff count={candidate.absentDays} />}
          {candidate.alreadyOnMission && <Tag size="xs">{t('needs.alreadyOnMission')}</Tag>}
        </Group>
        <div style={{ marginTop: 10, maxWidth: 260 }}>
          <AvailabilityMeter occupation={candidate.peakOccupation} availability={candidate.availability} compact />
        </div>
      </div>
    </div>
  );
}
