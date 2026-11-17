import { ActionIcon, Box, Burger, Drawer, Menu, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure, useOs, useWindowScroll } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation } from 'react-router';
import { Logo } from '@/components/Logo';
import { PageLoader } from '@/components/PageLoader';
import { GlobalSearch } from './GlobalSearch';
import classes from './AppLayout.module.css';
import { isActive, NAVIGATION } from './navigation';
import { ColorSchemeToggle, UserMenu } from './UserMenu';

/** The sections shown directly in the top bar; the last one (reference data) is grouped in a menu. */
const PRIMARY = NAVIGATION.slice(0, -1).flatMap((section) => section.items);
const SECONDARY = NAVIGATION[NAVIGATION.length - 1];

export function AppLayout() {
  const { t } = useTranslation();
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const os = useOs();
  const [scroll] = useWindowScroll();
  const secondaryActive = SECONDARY.items.some((item) => isActive(item.to, location.pathname));

  // Close the mobile menu after navigating, and start each page at the top.
  useEffect(() => {
    close();
    window.scrollTo({ top: 0 });
  }, [location.pathname, close]);

  return (
    <>
      <header className={classes.header} data-scrolled={scroll.y > 8 || undefined}>
        <div className={classes.bar}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label={t('layout.toggleMenu')} />
            <Link to="/" className={classes.brand} aria-label="Staffing Hub">
              <Logo withText />
            </Link>
          </Box>

          <Box className={classes.navWrap} visibleFrom="md">
          <nav className={classes.nav} aria-label={t('layout.mainNavigation')}>
            {PRIMARY.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={classes.navLink}
                data-active={isActive(item.to, location.pathname) || undefined}
                aria-current={isActive(item.to, location.pathname) ? 'page' : undefined}
              >
                {t(item.label)}
              </Link>
            ))}
            <Menu position="bottom" trigger="click-hover" openDelay={60} closeDelay={160} width={280} offset={10}>
              <Menu.Target>
                <UnstyledButton className={classes.navLink} data-active={secondaryActive || undefined}>
                  {t(SECONDARY.label)}
                  <IconChevronDown size={14} stroke={2} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown p={6}>
                {SECONDARY.items.map((item) => (
                  <Menu.Item
                    key={item.to}
                    component={Link}
                    to={item.to}
                    leftSection={<item.icon size={18} stroke={1.5} />}
                    bg={isActive(item.to, location.pathname) ? 'var(--sh-primary-soft)' : undefined}
                    py={8}
                  >
                    <Text size="sm" fw={600}>
                      {t(item.label)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t(item.description)}
                    </Text>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </nav>
          </Box>

          <div className={classes.tools}>
            <UnstyledButton className={classes.searchButton} onClick={() => spotlight.open()} visibleFrom="lg">
              <IconSearch size={16} stroke={1.8} />
              <span>{t('search.button')}</span>
              <span className={classes.kbd}>{os === 'macos' ? '⌘K' : 'Ctrl K'}</span>
            </UnstyledButton>
            <ActionIcon size="lg" hiddenFrom="lg" onClick={() => spotlight.open()} aria-label={t('search.button')}>
              <IconSearch size={19} stroke={1.7} />
            </ActionIcon>
            <ColorSchemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <Drawer opened={opened} onClose={close} size="100%" padding="lg" title={<Logo withText />} hiddenFrom="md">
        {NAVIGATION.map((section, sectionIndex) => (
          <nav key={section.label} className={classes.drawerSection} aria-label={t(section.label)}>
            <Text className="sh-label" mb={4}>
              {t(section.label)}
            </Text>
            {section.items.map((item, index) => {
              const number = NAVIGATION.slice(0, sectionIndex).reduce((sum, previous) => sum + previous.items.length, 0) + index + 1;
              return (
                <Link key={item.to} to={item.to} className={classes.drawerLink} data-active={isActive(item.to, location.pathname) || undefined}>
                  <span className={classes.drawerIndex}>{String(number).padStart(2, '0')}</span>
                  <em>{t(item.label)}</em>
                </Link>
              );
            })}
          </nav>
        ))}
      </Drawer>

      <main className={classes.content}>
        <Suspense fallback={<PageLoader />}>
          <div key={location.pathname} className="sh-rise">
            <Outlet />
          </div>
        </Suspense>
      </main>

      <GlobalSearch />
    </>
  );
}
