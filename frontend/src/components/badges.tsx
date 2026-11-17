import { Badge, Group, Tooltip, type BadgeProps } from '@mantine/core';
import { IconAlertTriangle, IconDoorExit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BusinessUnit, Community, MissionStatus, Seniority, SkillLevel } from '@/api/types';
import {
  COMMUNITY_COLORS,
  MISSION_STATUS_COLORS,
  SENIORITY_COLORS,
  SKILL_LEVEL_COLORS,
  SKILL_LEVELS,
  skillLevelRank,
} from '@/lib/enums';
import { formatDate } from '@/lib/format';

type Size = BadgeProps['size'];

export function SeniorityBadge({ value, size = 'sm' }: { value: Seniority; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Badge color={SENIORITY_COLORS[value]} size={size}>
      {t(`enums.seniority.${value}`)}
    </Badge>
  );
}

export function CommunityBadge({ value, size = 'sm' }: { value: Community; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Badge color={COMMUNITY_COLORS[value]} size={size} variant="dot">
      {t(`enums.community.${value}`)}
    </Badge>
  );
}

export function MissionStatusBadge({ value, size = 'sm' }: { value: MissionStatus; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Badge color={MISSION_STATUS_COLORS[value]} size={size} variant={value === 'ONGOING' ? 'filled' : 'light'}>
      {t(`enums.missionStatus.${value}`)}
    </Badge>
  );
}

export function BusinessUnitBadge({ value, size = 'sm' }: { value: BusinessUnit; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Badge color="gray" size={size} variant="outline">
      {t(`enums.businessUnit.${value}`)}
    </Badge>
  );
}

/** A skill level as a label plus five dots (filled up to the level). */
export function SkillLevelBadge({ value, size = 'sm' }: { value: SkillLevel; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Badge color={SKILL_LEVEL_COLORS[value]} size={size} leftSection={<LevelDots value={value} />}>
      {t(`enums.skillLevel.${value}`)}
    </Badge>
  );
}

export function LevelDots({ value }: { value: SkillLevel }) {
  const rank = skillLevelRank(value);
  return (
    <Group gap={2} wrap="nowrap" aria-hidden="true">
      {SKILL_LEVELS.map((level, index) => (
        <span
          key={level}
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: 'currentColor',
            opacity: index < rank ? 1 : 0.25,
          }}
        />
      ))}
    </Group>
  );
}

export function FormerEmployeeBadge({ departureDate }: { departureDate: string }) {
  const { t } = useTranslation();
  const past = new Date(departureDate) <= new Date();
  return (
    <Tooltip label={t('employees.departureOn', { date: formatDate(departureDate) })}>
      <Badge color={past ? 'gray' : 'orange'} size="sm" leftSection={<IconDoorExit size={12} />}>
        {past ? t('employees.former') : t('employees.leaving')}
      </Badge>
    </Tooltip>
  );
}

export function OverbookedBadge({ size = 'sm' }: { size?: Size }) {
  const { t } = useTranslation();
  return (
    <Badge color="red" size={size} leftSection={<IconAlertTriangle size={12} />}>
      {t('availability.overbooked')}
    </Badge>
  );
}
