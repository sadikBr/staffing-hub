import { Button, Center, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Logo } from './Logo';

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <Center h="100dvh">
      <Stack align="center" gap="lg">
        <Logo size={40} withText />
        <Loader size="sm" type="dots" color="var(--sh-primary)" />
        {label && <Text className="sh-label">{label}</Text>}
      </Stack>
    </Center>
  );
}

interface FullPageErrorProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function FullPageError({ title, message, actionLabel, onAction }: FullPageErrorProps) {
  return (
    <Center h="100dvh" p="md">
      <Stack align="center" gap="sm" maw={460} ta="center">
        <IconAlertTriangle size={36} stroke={1.4} color="var(--sh-over)" />
        <Title order={2} fw={400}>
          {title}
        </Title>
        <Text c="var(--sh-text-2)">{message}</Text>
        <Button mt="md" onClick={onAction}>
          {actionLabel}
        </Button>
      </Stack>
    </Center>
  );
}
