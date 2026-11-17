import { Badge, Group, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Spotlight } from '@mantine/spotlight';
import { IconBriefcase, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useEmployees } from '@/api/hooks/employees';
import { useMissions } from '@/api/hooks/missions';
import { MissionStatusBadge } from '@/components/badges';
import { EmployeeAvatar } from '@/components/EmployeeAvatar';
import { fullName } from '@/lib/format';
import { NAVIGATION } from './navigation';

/** Ctrl/Cmd + K: jump to any page, employee or mission. */
export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced] = useDebouncedValue(query.trim(), 200);
  const searching = debounced.length >= 2;

  const employees = useEmployees({ search: debounced, size: 6, includeFormer: true }, { enabled: searching });
  const missions = useMissions({ search: debounced, size: 6 }, { enabled: searching });

  const pages = NAVIGATION.flatMap((section) => section.items).filter((item) =>
    t(item.label).toLowerCase().includes(query.trim().toLowerCase()),
  );
  const employeeResults = searching ? (employees.data?.content ?? []) : [];
  const missionResults = searching ? (missions.data?.content ?? []) : [];
  const nothing = pages.length === 0 && employeeResults.length === 0 && missionResults.length === 0;

  const go = (to: string) => {
    navigate(to);
    setQuery('');
  };

  return (
    <Spotlight.Root query={query} onQueryChange={setQuery} shortcut={['mod + K', '/']}>
      <Spotlight.Search placeholder={t('search.placeholder')} leftSection={<IconSearch size={18} stroke={1.6} />} />
      <Spotlight.ActionsList>
        {employeeResults.length > 0 && (
          <Spotlight.ActionsGroup label={t('nav.employees')}>
            {employeeResults.map((employee) => (
              <Spotlight.Action key={employee.id} onClick={() => go(`/employees/${employee.id}`)}>
                <Group wrap="nowrap" w="100%">
                  <EmployeeAvatar person={employee} size="sm" />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {fullName(employee)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t(`enums.seniority.${employee.seniority}`)} · {t(`enums.community.${employee.community}`)}
                    </Text>
                  </div>
                </Group>
              </Spotlight.Action>
            ))}
          </Spotlight.ActionsGroup>
        )}
        {missionResults.length > 0 && (
          <Spotlight.ActionsGroup label={t('nav.missions')}>
            {missionResults.map((mission) => (
              <Spotlight.Action key={mission.id} onClick={() => go(`/missions/${mission.id}`)}>
                <Group wrap="nowrap" w="100%">
                  <IconBriefcase size={20} stroke={1.5} />
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {mission.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {mission.customer.label} · {mission.projectName}
                    </Text>
                  </div>
                  <MissionStatusBadge value={mission.status} size="xs" />
                </Group>
              </Spotlight.Action>
            ))}
          </Spotlight.ActionsGroup>
        )}
        {pages.length > 0 && (
          <Spotlight.ActionsGroup label={t('search.pages')}>
            {pages.map((item) => (
              <Spotlight.Action
                key={item.to}
                label={t(item.label)}
                description={t(item.description)}
                leftSection={<item.icon size={20} stroke={1.5} />}
                onClick={() => go(item.to)}
              />
            ))}
          </Spotlight.ActionsGroup>
        )}
        {nothing && <Spotlight.Empty>{t('search.nothingFound')}</Spotlight.Empty>}
      </Spotlight.ActionsList>
      {!searching && (
        <Group justify="center" py="xs">
          <Badge variant="transparent" color="gray" size="sm">
            {t('search.hint')}
          </Badge>
        </Group>
      )}
    </Spotlight.Root>
  );
}
