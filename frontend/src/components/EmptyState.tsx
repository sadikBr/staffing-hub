import { Stack, Text, ThemeIcon } from '@mantine/core';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <Stack align="center" gap={6} py={compact ? 'lg' : 48} px="md" ta="center">
      <ThemeIcon size={compact ? 40 : 52} radius="xl" variant="light" color="gray">
        {icon}
      </ThemeIcon>
      <Text fw={600} mt={4}>
        {title}
      </Text>
      {description && (
        <Text c="dimmed" size="sm" maw={420}>
          {description}
        </Text>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </Stack>
  );
}
