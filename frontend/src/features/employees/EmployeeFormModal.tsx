import { Button, Grid, Group, Modal, Select, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { employeeApi } from '@/api/hooks/employees';
import type { Community, Employee, Seniority } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { EmployeeSelect } from '@/components/EmployeeSelect';
import { COMMUNITIES, SENIORITIES } from '@/lib/enums';
import { fullName } from '@/lib/format';

interface FormValues {
  firstName: string;
  lastName: string;
  seniority: Seniority | null;
  community: Community | null;
  managerId: string | null;
  departureDate: string | null;
  comment: string;
}

const EMPTY: FormValues = {
  firstName: '',
  lastName: '',
  seniority: null,
  community: null,
  managerId: null,
  departureDate: null,
  comment: '',
};

/** Creates an employee (then opens their page), or edits one. */
export function EmployeeFormModal({ opened, onClose, employee }: { opened: boolean; onClose: () => void; employee?: Employee }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    initialValues: EMPTY,
    validate: {
      firstName: (value) => (value.trim() ? null : t('validation.required')),
      lastName: (value) => (value.trim() ? null : t('validation.required')),
      seniority: (value) => (value ? null : t('validation.required')),
      community: (value) => (value ? null : t('validation.required')),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      employee
        ? {
            firstName: employee.firstName,
            lastName: employee.lastName,
            seniority: employee.seniority,
            community: employee.community,
            managerId: employee.manager?.id ?? null,
            departureDate: employee.departureDate ?? null,
            comment: employee.comment ?? '',
          }
        : EMPTY,
    );
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal opens
  }, [opened, employee]);

  const save = useApiMutation({
    mutationFn: (values: FormValues) => {
      const body = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        seniority: values.seniority!,
        community: values.community!,
        managerId: values.managerId ?? undefined,
        departureDate: values.departureDate ?? undefined,
        comment: values.comment.trim() || undefined,
        version: employee?.version,
      };
      return employee ? employeeApi.update({ id: employee.id, body }) : employeeApi.create(body);
    },
    successMessage: (saved) =>
      employee ? t('employees.updated') : t('employees.created', { name: fullName(saved) }),
    onSuccess: (saved) => {
      onClose();
      if (!employee) navigate(`/employees/${saved.id}`);
    },
    form,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={employee ? t('employees.editTitle') : t('employees.createTitle')} size="lg">
      <form onSubmit={form.onSubmit((values) => save.mutate(values))}>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput label={t('employees.fields.firstName')} withAsterisk data-autofocus maxLength={255} {...form.getInputProps('firstName')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput label={t('employees.fields.lastName')} withAsterisk maxLength={255} {...form.getInputProps('lastName')} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('employees.fields.seniority')}
              withAsterisk
              data={SENIORITIES.map((value) => ({ value, label: t(`enums.seniority.${value}`) }))}
              {...form.getInputProps('seniority')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('employees.fields.community')}
              withAsterisk
              searchable
              data={COMMUNITIES.map((value) => ({ value, label: t(`enums.community.${value}`) }))}
              {...form.getInputProps('community')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <EmployeeSelect
              label={t('employees.fields.manager')}
              description={t('employees.fields.managerHelp')}
              excludeId={employee?.id}
              value={form.values.managerId}
              onChange={(value) => form.setFieldValue('managerId', value)}
              error={form.errors.managerId}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateInput
              label={t('employees.fields.departureDate')}
              description={t('employees.fields.departureDateHelp')}
              placeholder={t('common.optional')}
              clearable
              valueFormat="D MMM YYYY"
              {...form.getInputProps('departureDate')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label={t('employees.fields.comment')}
              placeholder={t('employees.fields.commentPlaceholder')}
              autosize
              minRows={3}
              maxRows={8}
              maxLength={5000}
              {...form.getInputProps('comment')}
            />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {employee ? t('common.save') : t('employees.createButton')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
