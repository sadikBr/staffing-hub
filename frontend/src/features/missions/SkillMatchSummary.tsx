import { Badge, Group, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCheck, IconMinus, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RequiredSkillMatch } from '@/api/types';

type MatchState = 'met' | 'below' | 'missing';

function matchState(match: RequiredSkillMatch): MatchState {
  if (match.meetsRequirement) return 'met';
  return match.employeeLevel ? 'below' : 'missing';
}

const STATE_COLORS: Record<MatchState, string> = { met: 'teal', below: 'orange', missing: 'red' };

/** "2/3 skills" badge, with the detail of each required skill in a tooltip. */
export function SkillMatchSummary({ matches }: { matches: RequiredSkillMatch[] }) {
  const { t } = useTranslation();
  const met = matches.filter((match) => match.meetsRequirement).length;
  const color = met === matches.length ? 'teal' : met === 0 ? 'red' : 'orange';
  return (
    <Tooltip label={<SkillMatchList matches={matches} />} multiline w={300} withArrow>
      <Badge color={color} variant="light" size="sm" leftSection={met === matches.length ? <IconCheck size={12} /> : undefined}>
        {t('missions.skillMatch.summary', { met, total: matches.length })}
      </Badge>
    </Tooltip>
  );
}

/** One line per required skill: what is required and what the employee has. */
export function SkillMatchList({ matches }: { matches: RequiredSkillMatch[] }) {
  const { t } = useTranslation();
  return (
    <Stack gap={6} py={4}>
      {matches.map((match) => {
        const state = matchState(match);
        return (
          <Group key={match.skill.id} gap="xs" wrap="nowrap" align="flex-start">
            <ThemeIcon size={18} radius="xl" color={STATE_COLORS[state]} variant="filled">
              {state === 'met' ? <IconCheck size={12} /> : state === 'below' ? <IconMinus size={12} /> : <IconX size={12} />}
            </ThemeIcon>
            <div>
              <Text size="xs" fw={600}>
                {match.skill.label}
              </Text>
              <Text size="xs" opacity={0.8}>
                {t('missions.skillMatch.required', {
                  level: match.requiredLevel ? t(`enums.skillLevel.${match.requiredLevel}`) : t('common.anyLevel'),
                })}
                {' · '}
                {match.employeeLevel
                  ? t('missions.skillMatch.has', { level: t(`enums.skillLevel.${match.employeeLevel}`) })
                  : t('missions.skillMatch.missing')}
              </Text>
            </div>
          </Group>
        );
      })}
    </Stack>
  );
}
