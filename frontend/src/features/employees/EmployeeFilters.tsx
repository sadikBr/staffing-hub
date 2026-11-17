import { Badge, Button, Collapse, Group, Select, TextInput, UnstyledButton } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { IconAdjustmentsHorizontal, IconCheck, IconDoorExit, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useRoles, useTechnologies } from '@/api/hooks/reference';
import { COMMUNITIES, SENIORITIES, SKILL_LEVELS } from '@/lib/enums';
import type { EmployeeFilterValues } from './employeeFilterQuery';
import classes from './EmployeeFilters.module.css';

interface EmployeeFiltersProps {
  values: EmployeeFilterValues;
  onChange: (changes: Partial<EmployeeFilterValues>) => void;
  onClear: () => void;
  activeCount: number;
  /** Extra controls at the end of the first row (e.g. sorting). */
  extra?: ReactNode;
}

export function EmployeeFilters({ values, onChange, onClear, activeCount, extra }: EmployeeFiltersProps) {
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
  const includeFormer = values.includeFormer === 'true';

  return (
    <div>
      <Group gap="xs" wrap="wrap">
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
          w={{ base: 'calc(50% - 5px)', sm: 160 }}
          aria-label={t('employees.fields.seniority')}
        />
        <Select
          placeholder={t('employees.fields.community')}
          data={COMMUNITIES.map((value) => ({ value, label: t(`enums.community.${value}`) }))}
          value={values.community || null}
          onChange={(value) => onChange({ community: value ?? '' })}
          clearable
          w={{ base: 'calc(50% - 5px)', sm: 160 }}
          aria-label={t('employees.fields.community')}
        />
        <Button
          variant={advanced || advancedCount > 0 ? 'light' : 'subtle'}
          color={advanced || advancedCount > 0 ? 'brand' : 'gray'}
          leftSection={<IconAdjustmentsHorizontal size={16} />}
          rightSection={
            advancedCount > 0 ? (
              <Badge size="xs" circle variant="filled">
                {advancedCount}
              </Badge>
            ) : undefined
          }
          onClick={toggle}
          aria-expanded={advanced}
        >
          {t('employees.filters.more')}
        </Button>
        {activeCount > 0 && (
          <Button variant="subtle" color="gray" leftSection={<IconX size={14} />} onClick={onClear}>
            {t('common.clearFilters')}
          </Button>
        )}
        {extra && <div className={classes.extra}>{extra}</div>}
      </Group>

      <Collapse in={advanced}>
        <div className={classes.advanced}>
          <Select
            placeholder={t('employees.filters.anyRole')}
            aria-label={t('employees.fields.role')}
            data={(roles.data ?? []).map((role) => ({ value: role.id, label: role.label }))}
            value={values.roleId || null}
            onChange={(value) => onChange({ roleId: value ?? '' })}
            clearable
            searchable
          />
          <Select
            placeholder={t('employees.filters.anyTechnology')}
            aria-label={t('employees.fields.technology')}
            data={(technologies.data ?? []).map((technology) => ({ value: technology.id, label: technology.label }))}
            value={values.technologyId || null}
            onChange={(value) => onChange({ technologyId: value ?? '' })}
            clearable
            searchable
          />
          <Select
            placeholder={t('employees.filters.anySkill')}
            aria-label={t('employees.fields.skill')}
            data={skillOptions}
            value={values.skillId || null}
            onChange={(value) => onChange({ skillId: value ?? '', minSkillLevel: value ? values.minSkillLevel : '' })}
            clearable
            searchable
          />
          <Select
            placeholder={values.skillId ? t('employees.filters.anyLevel') : t('employees.filters.pickSkillFirst')}
            aria-label={t('employees.filters.minLevel')}
            data={SKILL_LEVELS.map((value) => ({ value, label: t('employees.filters.atLeast', { level: t(`enums.skillLevel.${value}`) }) }))}
            value={values.minSkillLevel || null}
            onChange={(value) => onChange({ minSkillLevel: value ?? '' })}
            disabled={!values.skillId}
            clearable
          />
          <UnstyledButton
            className={classes.toggle}
            data-checked={includeFormer || undefined}
            role="switch"
            aria-checked={includeFormer}
            onClick={() => onChange({ includeFormer: includeFormer ? '' : 'true' })}
          >
            {includeFormer ? <IconCheck size={15} stroke={2.4} /> : <IconDoorExit size={15} stroke={1.8} />}
            {t('employees.filters.includeFormer')}
          </UnstyledButton>
        </div>
      </Collapse>
    </div>
  );
}
