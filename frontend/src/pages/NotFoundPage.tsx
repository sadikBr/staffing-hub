import { Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconMapPinOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Stack align="center" gap="sm" py={100} ta="center">
      <ThemeIcon size={64} radius="xl" variant="light">
        <IconMapPinOff size={34} />
      </ThemeIcon>
      <Title order={2}>{t('notFound.title')}</Title>
      <Text c="dimmed" maw={420}>
        {t('notFound.message')}
      </Text>
      <Button component={Link} to="/" mt="sm">
        {t('notFound.backHome')}
      </Button>
    </Stack>
  );
}
