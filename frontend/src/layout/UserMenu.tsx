import { ActionIcon, Avatar, Badge, Menu, Text, Tooltip, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconLanguage, IconLogout, IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/auth/session';
import { changeLanguage, SUPPORTED_LANGUAGES } from '@/i18n';

export function ColorSchemeToggle() {
  const { t } = useTranslation();
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');
  const next = computed === 'dark' ? 'light' : 'dark';
  return (
    <Tooltip label={t(next === 'dark' ? 'layout.darkMode' : 'layout.lightMode')}>
      <ActionIcon size="lg" onClick={() => setColorScheme(next)} aria-label={t('layout.toggleColorScheme')}>
        {computed === 'dark' ? <IconSun size={19} stroke={1.6} /> : <IconMoon size={19} stroke={1.6} />}
      </ActionIcon>
    </Tooltip>
  );
}

export function UserMenu() {
  const { t, i18n } = useTranslation();
  const session = useSession();

  if (!session.authEnabled) {
    return (
      <Tooltip label={t('layout.devModeTooltip')} multiline w={260}>
        <Badge color="orange" variant="light">
          {t('layout.devMode')}
        </Badge>
      </Tooltip>
    );
  }

  const name = session.userName ?? t('layout.user');
  const userInitials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <Menu position="bottom-end" width={240} shadow="md">
      <Menu.Target>
        <ActionIcon size="lg" radius="xl" variant="transparent" aria-label={t('layout.account')}>
          <Avatar radius="xl" size={34} color="brand">
            {userInitials}
          </Avatar>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={600} c="var(--mantine-color-text)">
            {name}
          </Text>
          {session.email && (
            <Text size="xs" c="dimmed">
              {session.email}
            </Text>
          )}
        </Menu.Label>
        {SUPPORTED_LANGUAGES.length > 1 && (
          <>
            <Menu.Divider />
            <Menu.Label>{t('layout.language')}</Menu.Label>
            {SUPPORTED_LANGUAGES.map((language) => (
              <Menu.Item
                key={language.code}
                leftSection={<IconLanguage size={16} />}
                onClick={() => changeLanguage(language.code)}
                fw={i18n.language === language.code ? 600 : undefined}
              >
                {language.label}
              </Menu.Item>
            ))}
          </>
        )}
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={session.signOut}>
          {t('layout.signOut')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
