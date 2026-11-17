import { ActionIcon, Button, Group, Modal, SegmentedControl, Stack, Text, Textarea, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconBeach, IconBook, IconDots, IconFirstAidKit, IconPencil, IconPlus, IconTrash, type Icon } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { absenceApi, useAbsences } from '@/api/hooks/absences';
import type { Absence, AbsenceType } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { confirmDelete } from '@/components/confirmDelete';
import { QueryError } from '@/components/QueryError';
import { Section } from '@/components/Section';
import { TableSkeleton } from '@/components/TableSkeleton';
import { formatPeriod, today } from '@/lib/format';
import classes from './EmployeeAbsences.module.css';

const ABSENCE_TYPES: AbsenceType[] = ['HOLIDAY', 'SICK_LEAVE', 'TRAINING', 'OTHER'];

const ICONS: Record<AbsenceType, Icon> = {
  HOLIDAY: IconBeach,
  SICK_LEAVE: IconFirstAidKit,
  TRAINING: IconBook,
  OTHER: IconDots,
};

const COLORS: Record<AbsenceType, string> = {
  HOLIDAY: 'var(--mantine-color-cyan-6)',
  SICK_LEAVE: 'var(--mantine-color-pink-6)',
  TRAINING: 'var(--mantine-color-violet-6)',
  OTHER: 'var(--mantine-color-gray-6)',
};

/** The employee's time off: upcoming first, then past. */
export function EmployeeAbsences({ employeeId }: { employeeId: string }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const absences = useAbsences(employeeId);
  const [opened, { open, close }] = useDisclosure();
  const [editing, setEditing] = useState<Absence>();
  const [showPast, setShowPast] = useState(false);
  const remove = useApiMutation({ mutationFn: absenceApi.remove, successMessage: t('absences.deleted') });

  const now = today();
  const upcoming = (absences.data ?? []).filter((absence) => absence.endDate >= now).reverse();
  const past = (absences.data ?? []).filter((absence) => absence.endDate < now);
  const shown = showPast ? [...upcoming, ...past] : upcoming;

  const openCreate = () => {
    setEditing(undefined);
    open();
  };

  return (
    <Section
      title={t('absences.title')}
      description={t('absences.description')}
      icon={<IconBeach size={17} stroke={1.8} />}
      sheet="padded"
      actions={
        canEdit && (
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={openCreate}>
            {t('absences.add')}
          </Button>
        )
      }
    >
      {absences.isPending ? (
        <TableSkeleton rows={2} columns={2} />
      ) : absences.isError ? (
        <QueryError error={absences.error} onRetry={() => void absences.refetch()} />
      ) : (
        <>
          {shown.length === 0 ? (
            <Text size="sm" c="dimmed">
              {past.length > 0 ? t('absences.noneUpcoming') : t('absences.none')}
            </Text>
          ) : (
            <div className={classes.list}>
              {shown.map((absence) => {
                const TypeIcon = ICONS[absence.type];
                const current = absence.startDate <= now && absence.endDate >= now;
                return (
                  <div key={absence.id} className={classes.row} data-past={absence.endDate < now || undefined}>
                    <span className={classes.icon} style={{ '--c': COLORS[absence.type] } as React.CSSProperties}>
                      <TypeIcon size={16} stroke={1.8} />
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Group gap={8} wrap="nowrap">
                        <Text size="sm" fw={600}>
                          {t(`absences.types.${absence.type}`)}
                        </Text>
                        {current && <span className={classes.now}>{t('absences.now')}</span>}
                      </Group>
                      <Text size="xs" c="dimmed" truncate>
                        {formatPeriod(absence.startDate, absence.endDate)} · {t('absences.workingDays', { count: absence.workingDays })}
                        {absence.comment ? ` · ${absence.comment}` : ''}
                      </Text>
                    </div>
                    {canEdit && (
                      <Group gap={0} wrap="nowrap" className={classes.actions}>
                        <Tooltip label={t('common.edit')}>
                          <ActionIcon
                            aria-label={t('common.edit')}
                            onClick={() => {
                              setEditing(absence);
                              open();
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
                                title: t('absences.deleteTitle'),
                                message: t('absences.deleteMessage', { period: formatPeriod(absence.startDate, absence.endDate) }),
                                onConfirm: () => remove.mutate({ employeeId, absenceId: absence.id }),
                              })
                            }
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {past.length > 0 && (
            <Button variant="subtle" color="gray" size="compact-sm" mt="sm" onClick={() => setShowPast((value) => !value)}>
              {showPast ? t('absences.hidePast') : t('absences.showPast', { count: past.length })}
            </Button>
          )}
        </>
      )}
      <AbsenceModal employeeId={employeeId} absence={editing} opened={opened} onClose={close} />
    </Section>
  );
}

function AbsenceModal({ employeeId, absence, opened, onClose }: { employeeId: string; absence?: Absence; opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [type, setType] = useState<AbsenceType>('HOLIDAY');
  const [period, setPeriod] = useState<[string | null, string | null]>([null, null]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!opened) return;
    setType(absence?.type ?? 'HOLIDAY');
    setPeriod(absence ? [absence.startDate, absence.endDate] : [null, null]);
    setComment(absence?.comment ?? '');
  }, [opened, absence]);

  const save = useApiMutation({
    mutationFn: () => {
      const body = { type, startDate: period[0]!, endDate: period[1] ?? period[0]!, comment: comment.trim() || undefined, version: absence?.version };
      return absence ? absenceApi.update({ employeeId, absenceId: absence.id, body }) : absenceApi.create({ employeeId, body });
    },
    successMessage: absence ? t('absences.updated') : t('absences.created'),
    onSuccess: onClose,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={absence ? t('absences.editTitle') : t('absences.createTitle')}>
      <Stack>
        <SegmentedControl
          fullWidth
          value={type}
          onChange={(value) => setType(value as AbsenceType)}
          data={ABSENCE_TYPES.map((value) => ({ value, label: t(`absences.types.${value}`) }))}
        />
        <DatePickerInput
          type="range"
          label={t('absences.period')}
          placeholder={t('absences.periodPlaceholder')}
          value={period}
          onChange={(value) => setPeriod(value as [string | null, string | null])}
          allowSingleDateInRange
          valueFormat="D MMM YYYY"
          numberOfColumns={2}
          withAsterisk
          defaultDate={absence?.startDate ?? dayjs().format('YYYY-MM-DD')}
        />
        <Textarea label={t('absences.comment')} placeholder={t('common.optional')} value={comment} onChange={(event) => setComment(event.currentTarget.value)} autosize minRows={2} />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!period[0]} loading={save.isPending} onClick={() => save.mutate()}>
            {t('common.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
