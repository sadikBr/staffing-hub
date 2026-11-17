import { Badge, Group, Loader, ScrollArea, Select, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCheck, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvailability } from '@/api/hooks/employees';
import type { MissionSkill, SkillLevel } from '@/api/types';
import { SeniorityBadge } from '@/components/badges';
import { EmployeeAvatar } from '@/components/EmployeeAvatar';
import { AvailabilityMeter } from '@/components/OccupationBar';
import { fullName, today } from '@/lib/format';
import classes from './CandidatePicker.module.css';

interface CandidatePickerProps {
  /** The assignment's period; availability is computed over it (from today when there is no start date). */
  from: string | null;
  to: string | null;
  value: string | null;
  onChange: (employeeId: string) => void;
  requiredSkills: MissionSkill[];
  error?: string;
}

/** Lists employees with their availability over the assignment's period, most available first. */
export function CandidatePicker({ from, to, value, onChange, requiredSkills, error }: CandidatePickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search.trim(), 250);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);

  const required = requiredSkills.find((skill) => skill.skill.id === skillFilter);
  const candidates = useAvailability({
    from: from ?? today(),
    to: from ? (to ?? undefined) : undefined,
    search: debounced || undefined,
    skillId: skillFilter ?? undefined,
    minSkillLevel: (required?.requiredLevel as SkillLevel | undefined) ?? undefined,
    size: 50,
  });

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end">
        <div>
          <Text size="sm" fw={500}>
            {t('missions.assignments.employee')} <Text span c="red">*</Text>
          </Text>
          <Text size="xs" c="dimmed">
            {from ? t('missions.assignments.candidatesHelp') : t('missions.assignments.candidatesHelpNoDate')}
          </Text>
        </div>
        {candidates.isFetching && <Loader size="xs" />}
      </Group>
      <Group gap="xs" wrap="nowrap">
        <TextInput
          size="sm"
          placeholder={t('employees.searchPlaceholder')}
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        {requiredSkills.length > 0 && (
          <Select
            size="sm"
            w={200}
            placeholder={t('missions.assignments.withSkill')}
            data={requiredSkills.map((skill) => ({ value: skill.skill.id, label: skill.skill.label }))}
            value={skillFilter}
            onChange={setSkillFilter}
            clearable
          />
        )}
      </Group>
      <ScrollArea.Autosize mah={300} className={classes.list} data-error={Boolean(error) || undefined}>
        {candidates.data?.content.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            {t('common.noResults')}
          </Text>
        )}
        {candidates.data?.content.map((candidate) => {
          const selected = candidate.id === value;
          return (
            <UnstyledButton
              key={candidate.id}
              className={classes.candidate}
              data-selected={selected || undefined}
              onClick={() => onChange(candidate.id)}
            >
              <Group wrap="nowrap" gap="sm">
                <EmployeeAvatar person={candidate} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={600} truncate>
                      {fullName(candidate)}
                    </Text>
                    {selected && (
                      <Badge size="xs" leftSection={<IconCheck size={10} />}>
                        {t('missions.assignments.selected')}
                      </Badge>
                    )}
                  </Group>
                  <SeniorityBadge value={candidate.seniority} size="xs" />
                </div>
                <AvailabilityMeter occupation={candidate.peakOccupation} availability={candidate.availability} compact />
              </Group>
            </UnstyledButton>
          );
        })}
      </ScrollArea.Autosize>
      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
}
