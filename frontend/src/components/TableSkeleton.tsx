import { Group, Skeleton, Stack } from '@mantine/core';

/** Placeholder rows while a table loads. */
export function TableSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Stack gap={0} px="md" py="xs">
      {Array.from({ length: rows }, (_, row) => (
        <Group key={row} gap="lg" wrap="nowrap" py="md">
          <Skeleton height={34} circle />
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} height={10} radius="xl" width={column === 0 ? '26%' : `${10 + ((row + column) % 3) * 6}%`} />
          ))}
        </Group>
      ))}
    </Stack>
  );
}
