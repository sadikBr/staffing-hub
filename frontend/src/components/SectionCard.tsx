import { Card, Group, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** No inner padding: for tables that go edge to edge. */
  flush?: boolean;
}

export function SectionCard({ title, description, icon, actions, children, flush = false }: SectionCardProps) {
  return (
    <Card padding={0}>
      <Group justify="space-between" px="lg" py="md" wrap="nowrap" style={{ borderBottom: '1px solid var(--app-border)' }}>
        <Group gap="sm" wrap="nowrap">
          {icon}
          <div>
            <Text fw={650}>{title}</Text>
            {description && (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            )}
          </div>
        </Group>
        {actions && <Group gap="xs">{actions}</Group>}
      </Group>
      <div style={{ padding: flush ? 0 : 'var(--mantine-spacing-lg)' }}>{children}</div>
    </Card>
  );
}

export function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" fw={500} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
        {label}
      </Text>
      <Text size="sm" mt={4} component="div">
        {children}
      </Text>
    </div>
  );
}
