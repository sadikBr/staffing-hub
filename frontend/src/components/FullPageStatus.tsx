import { Button, Center, Loader, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Logo } from './Logo';

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <Center h="100dvh">
      <Stack align="center" gap="md">
        <Logo size={44} />
        <Loader size="sm" type="dots" />
        {label && (
          <Text c="dimmed" size="sm">
            {label}
          </Text>
        )}
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
      <Stack align="center" gap="sm" maw={420} ta="center">
        <ThemeIcon size={56} radius="xl" color="red" variant="light">
          <IconAlertTriangle size={30} />
        </ThemeIcon>
        <Title order={3}>{title}</Title>
        <Text c="dimmed">{message}</Text>
        <Button mt="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </Stack>
    </Center>
  );
}
