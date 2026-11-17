import { Anchor, Box, Breadcrumbs, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface Crumb {
  label: string;
  to: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Shown before the title (e.g. an avatar). */
  leading?: ReactNode;
  /** Shown under the title (e.g. badges). */
  meta?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}

export function PageHeader({ title, description, leading, meta, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <Stack gap="xs" mb="xl">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separatorMargin={6} fz="sm">
          {breadcrumbs.map((crumb) => (
            <Anchor key={crumb.to} component={Link} to={crumb.to} c="dimmed" fz="sm">
              {crumb.label}
            </Anchor>
          ))}
        </Breadcrumbs>
      )}
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <Group gap="md" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
          {leading}
          <Box style={{ minWidth: 0 }}>
            <Title order={2} fw={700} style={{ letterSpacing: '-0.02em' }}>
              {title}
            </Title>
            {description && (
              <Text c="dimmed" size="sm" mt={4}>
                {description}
              </Text>
            )}
            {meta && <Box mt={8}>{meta}</Box>}
          </Box>
        </Group>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
}
