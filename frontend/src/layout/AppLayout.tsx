import { AppShell, Box, Burger, Group, Kbd, NavLink, ScrollArea, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure, useOs } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router';
import { Logo } from '@/components/Logo';
import { PageLoader } from '@/components/PageLoader';
import { GlobalSearch } from './GlobalSearch';
import classes from './AppLayout.module.css';
import { isActive, NAVIGATION } from './navigation';
import { ColorSchemeToggle, UserMenu } from './UserMenu';

export function AppLayout() {
  const { t } = useTranslation();
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const os = useOs();

  // Close the mobile menu after navigating, and start each page at the top.
  useEffect(() => {
    close();
    window.scrollTo({ top: 0 });
  }, [location.pathname, close]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={0}
      classNames={{ main: classes.main, header: classes.header, navbar: classes.navbar }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label={t('layout.toggleMenu')} />
            <Link to="/" className={classes.brand}>
              <Logo withText />
            </Link>
          </Group>

          <UnstyledButton className={classes.searchButton} onClick={() => spotlight.open()} visibleFrom="xs">
            <Group gap="xs" wrap="nowrap">
              <IconSearch size={16} stroke={1.8} />
              <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                {t('search.button')}
              </Text>
              <Kbd size="xs">{os === 'macos' ? '⌘ K' : 'Ctrl K'}</Kbd>
            </Group>
          </UnstyledButton>

          <Group gap="xs" wrap="nowrap">
            <Box hiddenFrom="xs">
              <UnstyledButton onClick={() => spotlight.open()} aria-label={t('search.button')} p={6}>
                <IconSearch size={20} stroke={1.6} />
              </UnstyledButton>
            </Box>
            <ColorSchemeToggle />
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <ScrollArea p="sm">
          {NAVIGATION.map((section) => (
            <Box key={section.label} mb="md">
              <Text className={classes.sectionLabel}>{t(section.label)}</Text>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  component={Link}
                  to={item.to}
                  label={t(item.label)}
                  leftSection={<item.icon size={19} stroke={1.6} />}
                  active={isActive(item.to, location.pathname)}
                  className={classes.navLink}
                />
              ))}
            </Box>
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box className={classes.content}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </Box>
      </AppShell.Main>

      <GlobalSearch />
    </AppShell>
  );
}
