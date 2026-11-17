import { Button, Grid, Group, Modal, NumberInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { missionApi } from '@/api/hooks/missions';
import type { Mission, MissionAssignment } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { formatPercent, fullName } from '@/lib/format';
import { CandidatePicker } from './CandidatePicker';

interface FormValues {
  employeeId: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: number | string;
  rate: number | string;
  appreciation: string;
  comment: string;
}

function periodDays(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  return dayjs(end).diff(dayjs(start), 'day') + 1;
}

/** Assigns an employee to the mission, or edits an assignment. Employees can be assigned whatever their skills. */
export function AssignmentFormModal({
  mission,
  assignment,
  opened,
  onClose,
}: {
  mission: Mission;
  assignment?: MissionAssignment;
  opened: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const form = useForm<FormValues>({
    initialValues: { employeeId: null, startDate: null, endDate: null, duration: '', rate: 100, appreciation: '', comment: '' },
    validate: {
      employeeId: (value) => (value ? null : t('missions.assignments.pickEmployee')),
      endDate: (value, values) =>
        value && values.startDate && dayjs(value).isBefore(values.startDate) ? t('missions.assignments.endBeforeStart') : null,
      duration: (value, values) => {
        if (value === '' || value === null) return null;
        const days = periodDays(values.startDate, values.endDate);
        if (Number(value) < 1) return t('missions.assignments.durationPositive');
        return days !== null && Number(value) > days ? t('missions.assignments.durationTooLong', { count: days }) : null;
      },
      rate: (value) => (value === '' || (Number(value) > 0 && Number(value) <= 100) ? null : t('missions.assignments.rateRange')),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      assignment
        ? {
            employeeId: assignment.employee.id,
            startDate: assignment.startDate ?? null,
            endDate: assignment.endDate ?? null,
            duration: assignment.duration ?? '',
            rate: assignment.rate ?? '',
            appreciation: assignment.appreciation ?? '',
            comment: assignment.comment ?? '',
          }
        : { employeeId: null, startDate: null, endDate: null, duration: '', rate: 100, appreciation: '', comment: '' },
    );
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal opens
  }, [opened, assignment]);

  const save = useApiMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        employeeId: values.employeeId!,
        startDate: values.startDate ?? undefined,
        endDate: values.endDate ?? undefined,
        duration: values.duration === '' ? undefined : Number(values.duration),
        rate: values.rate === '' ? undefined : Number(values.rate),
        appreciation: values.appreciation.trim() || undefined,
        comment: values.comment.trim() || undefined,
        version: assignment?.version,
      };
      return assignment
        ? missionApi.updateAssignment({ id: mission.id, assignmentId: assignment.id, body })
        : missionApi.createAssignment({ id: mission.id, body });
    },
    successMessage: (saved) =>
      assignment ? t('missions.assignments.updated') : t('missions.assignments.created', { name: fullName(saved.employee) }),
    onSuccess: (saved) => {
      onClose();
      if (saved.employeeOccupation?.overbooked) {
        notifications.show({
          color: 'orange',
          icon: <IconAlertTriangle size={18} />,
          title: t('missions.assignments.overbookedTitle'),
          message: t('missions.assignments.overbookedMessage', {
            name: fullName(saved.employee),
            value: formatPercent(saved.employeeOccupation.peakRate),
          }),
          autoClose: 9000,
        });
      }
    },
    form,
  });

  const days = periodDays(form.values.startDate, form.values.endDate);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={assignment ? t('missions.assignments.editTitle') : t('missions.assignments.createTitle', { mission: mission.label })}
    >
      <form onSubmit={form.onSubmit((values) => save.mutate(values))}>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Grid gutter="md">
              <Grid.Col span={6}>
                <DateInput label={t('missions.assignments.startDate')} placeholder={t('common.optional')} clearable valueFormat="D MMM YYYY" {...form.getInputProps('startDate')} />
              </Grid.Col>
              <Grid.Col span={6}>
                <DateInput
                  label={t('missions.assignments.endDate')}
                  placeholder={t('missions.assignments.ongoing')}
                  clearable
                  valueFormat="D MMM YYYY"
                  minDate={form.values.startDate ?? undefined}
                  {...form.getInputProps('endDate')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label={t('missions.assignments.duration')}
                  description={days !== null ? t('missions.assignments.durationMax', { count: days }) : t('missions.assignments.durationHelp')}
                  placeholder={t('common.optional')}
                  min={1}
                  max={days ?? undefined}
                  allowDecimal={false}
                  suffix={` ${t('missions.assignments.daysSuffix')}`}
                  {...form.getInputProps('duration')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label={t('missions.assignments.rate')}
                  description={t('missions.assignments.rateHelp')}
                  min={0.01}
                  max={100}
                  decimalScale={2}
                  suffix="%"
                  {...form.getInputProps('rate')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea label={t('missions.assignments.appreciation')} autosize minRows={2} maxRows={5} maxLength={5000} {...form.getInputProps('appreciation')} />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea label={t('missions.fields.comment')} autosize minRows={2} maxRows={5} maxLength={5000} {...form.getInputProps('comment')} />
              </Grid.Col>
            </Grid>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <CandidatePicker
              from={form.values.startDate}
              to={form.values.endDate}
              value={form.values.employeeId}
              onChange={(id) => form.setFieldValue('employeeId', id)}
              requiredSkills={mission.requiredSkills}
              error={typeof form.errors.employeeId === 'string' ? form.errors.employeeId : undefined}
            />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {assignment ? t('common.save') : t('missions.assignments.assign')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
