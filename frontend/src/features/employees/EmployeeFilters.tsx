import { Badge, Button, Collapse, Grid, Group, Select, Switch, TextInput } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoles, useTechnologies } from '@/api/hooks/reference';
import { COMMUNITIES, SENIORITIES, SKILL_LEVELS } from '@/lib/enums';
import type { EmployeeFilterValues } from './employeeFilterQuery';

interface EmployeeFiltersProps {
  values: EmployeeFilterValues;
  onChange: (changes: Partial<EmployeeFilterValues>) => void;
  onClear: () => void;
  activeCount: number;
}

export function EmployeeFilters({ values, onChange, onClear, activeCount }: EmployeeFiltersProps) {
  const { t } = useTranslation();
  const roles = useRoles();
  const technologies = useTechnologies();
  const advancedKeys = ['roleId', 'technologyId', 'skillId', 'minSkillLevel', 'includeFormer'] as const;
  const advancedCount = advancedKeys.filter((key) => values[key]).length;
  const [advanced, { toggle }] = useDisclosure(advancedCount > 0);

  // The search box updates the URL after a short pause, not on every keystroke.
  const [search, setSearch] = useState(values.search);
  const pushSearch = useDebouncedCallback((value: string) => onChange({ search: value }), 300);
  useEffect(() => setSearch(values.search), [values.search]);

  const skillOptions = useMemo(
    () =>
      (technologies.data ?? [])
        .filter((technology) => technology.skills.length > 0)
        .map((technology) => ({
          group: technology.label,
          items: technology.skills.map((skill) => ({ value: skill.id, label: skill.label })),
        })),
    [technologies.data],
  );

  return (
    <div>
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder={t('employees.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            pushSearch(event.currentTarget.value);
          }}
          style={{ flex: '1 1 220px' }}
          aria-label={t('common.search')}
        />
        <Select
          placeholder={t('employees.fields.seniority')}
          data={SENIORITIES.map((value) => ({ value, label: t(`enums.seniority.${value}`) }))}
          value={values.seniority || null}
          onChange={(value) => onChange({ seniority: value ?? '' })}
          clearable
          w={{ base: '48%', sm: 160 }}
          aria-label={t('employees.fields.seniority')}
        />
        <Select
          placeholder={t('employees.fields.community')}
          data={COMMUNITIES.map((value) => ({ value, label: t(`enums.community.${value}`) }))}
          value={values.community || null}
          onChange={(value) => onChange({ community: value ?? '' })}
          clearable
          w={{ base: '48%', sm: 160 }}
          aria-label={t('employees.fields.community')}
        />
        <Button
          variant={advanced ? 'light' : 'default'}
          leftSection={<IconAdjustmentsHorizontal size={16} />}
          rightSection={advancedCount > 0 ? <Badge size="xs" circle>{advancedCount}</Badge> : undefined}
          onClick={toggle}
        >
          {t('employees.filters.more')}
        </Button>
        {activeCount > 0 && (
          <Button variant="subtle" color="gray" leftSection={<IconX size={14} />} onClick={onClear}>
            {t('common.clearFilters')}
          </Button>
        )}
      </Group>

      <Collapse in={advanced}>
        <Grid mt="sm" gutter="sm" align="flex-end">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label={t('employees.fields.role')}
              placeholder={t('employees.filters.anyRole')}
              data={(roles.data ?? []).map((role) => ({ value: role.id, label: role.label }))}
              value={values.roleId || null}
              onChange={(value) => onChange({ roleId: value ?? '' })}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label={t('employees.fields.technology')}
              placeholder={t('employees.filters.anyTechnology')}
              data={(technologies.data ?? []).map((technology) => ({ value: technology.id, label: technology.label }))}
              value={values.technologyId || null}
              onChange={(value) => onChange({ technologyId: value ?? '' })}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 7, md: 2 }}>
            <Select
              label={t('employees.fields.skill')}
              placeholder={t('employees.filters.anySkill')}
              data={skillOptions}
              value={values.skillId || null}
              onChange={(value) => onChange({ skillId: value ?? '', minSkillLevel: value ? values.minSkillLevel : '' })}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 5, md: 2 }}>
            <Select
              label={t('employees.filters.minLevel')}
              placeholder={t('common.anyLevel')}
              data={SKILL_LEVELS.map((value) => ({ value, label: t(`enums.skillLevel.${value}`) }))}
              value={values.minSkillLevel || null}
              onChange={(value) => onChange({ minSkillLevel: value ?? '' })}
              disabled={!values.skillId}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Switch
              label={t('employees.filters.includeFormer')}
              checked={values.includeFormer === 'true'}
              onChange={(event) => onChange({ includeFormer: event.currentTarget.checked ? 'true' : '' })}
              mb={8}
            />
          </Grid.Col>
        </Grid>
      </Collapse>
    </div>
  );
}
