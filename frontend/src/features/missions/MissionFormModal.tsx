import { Button, Grid, Group, Modal, Select, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { missionApi } from '@/api/hooks/missions';
import { useCustomers } from '@/api/hooks/reference';
import type { BusinessUnit, Mission, MissionStatus } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { EmployeeSelect } from '@/components/EmployeeSelect';
import { BUSINESS_UNITS, MISSION_STATUSES } from '@/lib/enums';

interface FormValues {
  label: string;
  projectName: string;
  customerId: string | null;
  status: MissionStatus | null;
  businessUnit: BusinessUnit | null;
  projectManagerId: string | null;
  starUrl: string;
  description: string;
  comment: string;
}

const EMPTY: FormValues = {
  label: '',
  projectName: '',
  customerId: null,
  status: 'PROSPECT',
  businessUnit: null,
  projectManagerId: null,
  starUrl: '',
  description: '',
  comment: '',
};

/** Creates a mission (then opens its page), or edits one. */
export function MissionFormModal({
  opened,
  onClose,
  mission,
  defaultCustomerId,
}: {
  opened: boolean;
  onClose: () => void;
  mission?: Mission;
  defaultCustomerId?: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customers = useCustomers();
  const form = useForm<FormValues>({
    initialValues: EMPTY,
    validate: {
      label: (value) => (value.trim() ? null : t('validation.required')),
      projectName: (value) => (value.trim() ? null : t('validation.required')),
      customerId: (value) => (value ? null : t('validation.required')),
      status: (value) => (value ? null : t('validation.required')),
      starUrl: (value) => (!value.trim() || /^https?:\/\/\S+$/i.test(value.trim()) ? null : t('validation.url')),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      mission
        ? {
            label: mission.label,
            projectName: mission.projectName,
            customerId: mission.customer.id,
            status: mission.status,
            businessUnit: mission.businessUnit ?? null,
            projectManagerId: mission.projectManager?.id ?? null,
            starUrl: mission.starUrl ?? '',
            description: mission.description ?? '',
            comment: mission.comment ?? '',
          }
        : { ...EMPTY, customerId: defaultCustomerId ?? null },
    );
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal opens
  }, [opened, mission]);

  const save = useApiMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        label: values.label.trim(),
        projectName: values.projectName.trim(),
        customerId: values.customerId!,
        status: values.status!,
        businessUnit: values.businessUnit ?? undefined,
        projectManagerId: values.projectManagerId ?? undefined,
        starUrl: values.starUrl.trim() || undefined,
        description: values.description.trim() || undefined,
        comment: values.comment.trim() || undefined,
        version: mission?.version,
      };
      return mission ? missionApi.update({ id: mission.id, body }) : missionApi.create(body);
    },
    successMessage: (saved) => (mission ? t('missions.updated') : t('missions.created', { label: saved.label })),
    onSuccess: (saved) => {
      onClose();
      if (!mission) navigate(`/missions/${saved.id}`);
    },
    form,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={mission ? t('missions.editTitle') : t('missions.createTitle')} size="lg">
      <form onSubmit={form.onSubmit((values) => save.mutate(values))}>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput label={t('missions.fields.label')} placeholder={t('missions.fields.labelPlaceholder')} withAsterisk data-autofocus maxLength={255} {...form.getInputProps('label')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput label={t('missions.fields.projectName')} withAsterisk maxLength={255} {...form.getInputProps('projectName')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('missions.fields.customer')}
              withAsterisk
              searchable
              data={(customers.data ?? []).map((customer) => ({ value: customer.id, label: customer.label }))}
              nothingFoundMessage={t('missions.fields.noCustomer')}
              {...form.getInputProps('customerId')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <EmployeeSelect
              label={t('missions.fields.projectManager')}
              placeholder={t('common.optional')}
              value={form.values.projectManagerId}
              onChange={(value) => form.setFieldValue('projectManagerId', value)}
              error={form.errors.projectManagerId}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('missions.fields.status')}
              withAsterisk
              allowDeselect={false}
              data={MISSION_STATUSES.map((value) => ({ value, label: t(`enums.missionStatus.${value}`) }))}
              {...form.getInputProps('status')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('missions.fields.businessUnit')}
              placeholder={t('common.optional')}
              clearable
              data={BUSINESS_UNITS.map((value) => ({ value, label: t(`enums.businessUnit.${value}`) }))}
              {...form.getInputProps('businessUnit')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label={t('missions.fields.starUrl')}
              description={t('missions.fields.starUrlHelp')}
              placeholder="https://jira.example.com/browse/PROJ-123"
              maxLength={500}
              {...form.getInputProps('starUrl')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea label={t('missions.fields.description')} autosize minRows={2} maxRows={6} maxLength={5000} {...form.getInputProps('description')} />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea label={t('missions.fields.comment')} autosize minRows={2} maxRows={6} maxLength={5000} {...form.getInputProps('comment')} />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {mission ? t('common.save') : t('missions.createButton')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
