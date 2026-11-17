import { Button, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <Stack align="center" gap="sm" py={80} ta="center">
      <Text
        className="sh-serif"
        fz={{ base: 120, sm: 180 }}
        lh={0.9}
        fw={300}
        fs="italic"
        c="var(--sh-text)"
        style={{ letterSpacing: '-0.05em' }}
        aria-hidden="true"
      >
        4<span className="sh-mark">0</span>4
      </Text>
      <Title order={2} mt="md">
        {t('notFound.title')}
      </Title>
      <Text c="var(--sh-text-2)" maw={420}>
        {t('notFound.message')}
      </Text>
      <Button component={Link} to="/" mt="md" leftSection={<IconArrowLeft size={16} />}>
        {t('notFound.backHome')}
      </Button>
    </Stack>
  );
}
