import { Group, Skeleton, Stack } from '@mantine/core';

/** Placeholder rows while a table loads. */
export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Stack gap="md" p="md">
      {Array.from({ length: rows }, (_, row) => (
        <Group key={row} gap="lg" wrap="nowrap">
          <Skeleton height={32} circle />
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} height={12} radius="xl" width={column === 0 ? '30%' : `${12 + ((row + column) % 3) * 6}%`} />
          ))}
        </Group>
      ))}
    </Stack>
  );
}
