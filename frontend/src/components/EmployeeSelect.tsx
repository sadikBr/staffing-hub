import { Group, Select, Text, type SelectProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployee, useEmployees } from '@/api/hooks/employees';
import { fullName } from '@/lib/format';
import { EmployeeAvatar } from './EmployeeAvatar';

interface EmployeeSelectProps extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  value: string | null;
  onChange: (id: string | null) => void;
  /** An employee that must not be offered (e.g. the employee being edited, as their own manager). */
  excludeId?: string;
}

/** Picks an employee by typing part of their name (searches the server, so it scales to any team size). */
export function EmployeeSelect({ value, onChange, excludeId, ...props }: EmployeeSelectProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const results = useEmployees({ search: debounced || undefined, size: 20, sort: ['lastName', 'firstName'] });
  const selected = useEmployee(value ?? undefined);

  const options = useMemo(() => {
    const people = [...(results.data?.content ?? [])];
    if (selected.data && !people.some((person) => person.id === selected.data.id)) people.unshift(selected.data);
    return people
      .filter((person) => person.id !== excludeId)
      .map((person) => ({ value: person.id, label: fullName(person), person }));
  }, [results.data, selected.data, excludeId]);

  const byId = useMemo(() => new Map(options.map((option) => [option.value, option.person])), [options]);

  return (
    <Select
      searchable
      clearable
      placeholder={t('employees.searchPlaceholder')}
      nothingFoundMessage={results.isFetching ? t('common.loading') : t('common.noResults')}
      {...props}
      data={options.map(({ value: optionValue, label }) => ({ value: optionValue, label }))}
      value={value}
      onChange={onChange}
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options: all }) => all}
      renderOption={({ option }) => {
        const person = byId.get(option.value);
        return (
          <Group gap="sm" wrap="nowrap">
            {person && <EmployeeAvatar person={person} size="sm" />}
            <Text size="sm">{option.label}</Text>
          </Group>
        );
      }}
    />
  );
}
