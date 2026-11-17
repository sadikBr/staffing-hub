import { Group, Pagination, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { PageMetadata } from '@/api/types';

/** "Showing 21–40 of 132" + page buttons. Pages are 0-based in the API, 1-based on screen. */
export function TablePagination({ page, onChange }: { page: PageMetadata; onChange: (page: number) => void }) {
  const { t } = useTranslation();
  if (page.totalElements === 0) return null;
  const first = page.number * page.size + 1;
  const last = Math.min(first + page.size - 1, page.totalElements);

  return (
    <Group justify="space-between" pt="lg" px={4} wrap="wrap" gap="sm">
      <Text className="sh-label tabular-nums">{t('common.showingRange', { first, last, total: page.totalElements })}</Text>
      {page.totalPages > 1 && (
        <Pagination
          total={page.totalPages}
          value={page.number + 1}
          onChange={(value) => onChange(value - 1)}
          size="sm"
          radius="xl"
        />
      )}
    </Group>
  );
}
