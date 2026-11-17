import { Box, Stack, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

/** Nothing to show: an icon on a soft halo, a serif line, and what to do next. */
export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  const size = compact ? 46 : 64;
  return (
    <Stack align="center" gap={6} py={compact ? 'lg' : 56} px="md" ta="center">
      <Box
        w={size}
        h={size}
        style={{
          display: 'grid',
          placeItems: 'center',
          borderRadius: 999,
          background: 'var(--sh-primary-soft)',
          boxShadow: '0 0 0 8px color-mix(in srgb, var(--sh-primary) 5%, transparent)',
          color: 'var(--sh-primary-text)',
        }}
      >
        {icon}
      </Box>
      <Text className="sh-serif" fz={compact ? 18 : 24} fw={420} mt={12} lh={1.2}>
        {title}
      </Text>
      {description && (
        <Text c="dimmed" size="sm" maw={420}>
          {description}
        </Text>
      )}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </Stack>
  );
}
