import { Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api/errors';

/** Explains why data could not be loaded, with a retry button. */
export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const message = error instanceof ApiError && error.status < 500 ? error.message : t('errors.loadFailed');
  return (
    <div
      role="alert"
      style={{
        background: 'var(--sh-over-soft)',
        padding: 'var(--mantine-spacing-md) var(--mantine-spacing-lg)',
        borderRadius: 'var(--mantine-radius-lg)',
      }}
    >
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <IconAlertTriangle size={20} color="var(--sh-over)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <Text fw={600}>{t('errors.title')}</Text>
            <Text size="sm" c="var(--sh-text-2)">
              {message}
            </Text>
          </div>
        </Group>
        {onRetry && (
          <Button size="xs" variant="default" leftSection={<IconRefresh size={14} />} onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </Group>
    </div>
  );
}
