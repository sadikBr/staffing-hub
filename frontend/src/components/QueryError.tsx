import { Alert, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/api/errors';

/** Explains why data could not be loaded, with a retry button. */
export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const message = error instanceof ApiError && error.status < 500 ? error.message : t('errors.loadFailed');
  return (
    <Alert color="red" variant="light" icon={<IconAlertCircle />} title={t('errors.title')} radius="lg">
      {message}
      {onRetry && (
        <Button size="xs" variant="white" color="red" mt="sm" display="block" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </Alert>
  );
}
