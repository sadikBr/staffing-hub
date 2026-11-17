import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface LabelledRecord {
  id: string;
  label: string;
  version: number;
}

interface LabelFormModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  fieldLabel: string;
  placeholder?: string;
  /** The record being edited, or undefined to create one. */
  record?: LabelledRecord;
  submitting: boolean;
  onSubmit: (values: { label: string; version?: number }, form: { setErrors: (errors: Record<string, string>) => void }) => void;
}

/** Create or rename anything that is just a label (customer, role, technology...). */
export function LabelFormModal({ opened, onClose, title, fieldLabel, placeholder, record, submitting, onSubmit }: LabelFormModalProps) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: { label: '' },
    validate: { label: (value) => (value.trim() ? null : t('validation.required')) },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({ label: record?.label ?? '' });
      form.resetDirty();
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal opens
  }, [opened, record]);

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={form.onSubmit((values) => onSubmit({ label: values.label.trim(), version: record?.version }, form))}>
        <Stack>
          <TextInput label={fieldLabel} placeholder={placeholder} data-autofocus withAsterisk maxLength={255} {...form.getInputProps('label')} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={submitting}>
              {record ? t('common.save') : t('common.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
