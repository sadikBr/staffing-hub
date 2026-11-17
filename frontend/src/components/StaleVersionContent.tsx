import { Button, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

/** Explains that the record changed since it was loaded, and offers to reload it. */
export function StaleVersionContent({ onReload }: { onReload: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <Text size="sm">{t('errors.staleMessage')}</Text>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={() => modals.closeAll()}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => {
            onReload();
            modals.closeAll();
          }}
        >
          {t('errors.reload')}
        </Button>
      </Group>
    </>
  );
}
