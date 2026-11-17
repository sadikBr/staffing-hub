import { Group, Select, Text, type SelectProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMission, useMissions } from '@/api/hooks/missions';
import { missionColor } from '@/lib/timeline';

interface MissionSelectProps extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  value: string | null;
  onChange: (id: string | null) => void;
}

/** Picks a mission by typing part of its name, project or customer (searches the server). */
export function MissionSelect({ value, onChange, ...props }: MissionSelectProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const results = useMissions({ search: debounced || undefined, size: 20, sort: ['label,asc'] });
  const selected = useMission(value ?? undefined);

  const missions = useMemo(() => {
    const list = [...(results.data?.content ?? [])];
    if (selected.data && !list.some((mission) => mission.id === selected.data.id)) list.unshift(selected.data);
    return list;
  }, [results.data, selected.data]);
  const byId = useMemo(() => new Map(missions.map((mission) => [mission.id, mission])), [missions]);

  return (
    <Select
      searchable
      clearable
      nothingFoundMessage={results.isFetching ? t('common.loading') : t('common.noResults')}
      {...props}
      data={missions.map((mission) => ({ value: mission.id, label: mission.label }))}
      value={value}
      onChange={onChange}
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options }) => options}
      renderOption={({ option }) => {
        const mission = byId.get(option.value);
        return (
          <Group gap="sm" wrap="nowrap">
            <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: missionColor(option.value) }} />
            <div style={{ minWidth: 0 }}>
              <Text size="sm">{option.label}</Text>
              {mission && (
                <Text size="xs" c="dimmed">
                  {mission.customer.label}
                </Text>
              )}
            </div>
          </Group>
        );
      }}
    />
  );
}
