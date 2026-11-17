import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import i18n from '@/i18n';

interface ConfirmDeleteOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function confirmDelete({ title, message, confirmLabel, onConfirm }: ConfirmDeleteOptions) {
  modals.openConfirmModal({
    title,
    children: <Text size="sm">{message}</Text>,
    labels: { confirm: confirmLabel ?? i18n.t('common.delete'), cancel: i18n.t('common.cancel') },
    confirmProps: { color: 'red' },
    onConfirm,
  });
}
