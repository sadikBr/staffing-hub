import { Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconBeach, IconCheck, IconDoorExit } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { BusinessUnit, Community, MissionStatus, Seniority, SkillLevel } from '@/api/types';
import { communityColor, SENIORITIES, SKILL_LEVEL_COLORS, SKILL_LEVELS, skillLevelRank } from '@/lib/enums';
import { formatDate } from '@/lib/format';
import classes from './badges.module.css';

type Size = 'xs' | 'sm' | 'md' | 'lg';

interface TagProps {
  children: ReactNode;
  size?: Size;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  title?: string;
  'data-status'?: string;
}

/** A small rounded label. The base of every badge below. */
export function Tag({ children, size = 'sm', className, color, style, ...rest }: TagProps) {
  return (
    <span className={`${classes.tag} ${className ?? ''}`} data-size={size} style={{ ...(color ? { color } : {}), ...style }} {...rest}>
      {children}
    </span>
  );
}

/** Seniority as one to three pips and a label. `plain` drops the background (for tables). */
export function SeniorityBadge({ value, size = 'sm', plain = false }: { value: Seniority; size?: Size; plain?: boolean }) {
  const { t } = useTranslation();
  const rank = SENIORITIES.indexOf(value) + 1;
  return (
    <Tag size={size} className={plain ? classes.plain : undefined}>
      <span className={classes.pips} aria-hidden="true">
        {SENIORITIES.map((level, index) => (
          <span key={level} className={classes.pip} data-on={index < rank || undefined} />
        ))}
      </span>
      {t(`enums.seniority.${value}`)}
    </Tag>
  );
}

/** The community with its color: a dot and label, or a pill tinted with the color (`tinted`). */
export function CommunityBadge({ value, size = 'sm', tinted = false }: { value: Community; size?: Size; tinted?: boolean }) {
  const { t } = useTranslation();
  const color = communityColor(value);
  return (
    <Tag
      size={size}
      className={tinted ? undefined : classes.plain}
      style={
        tinted
          ? { background: `color-mix(in srgb, ${color} 13%, transparent)`, color: `color-mix(in srgb, ${color} 70%, var(--sh-text))` }
          : undefined
      }
    >
      <span className={classes.dot} style={{ background: color }} />
      {t(`enums.community.${value}`)}
    </Tag>
  );
}

export function MissionStatusBadge({ value, size = 'sm' }: { value: MissionStatus; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Tag size={size} className={classes.status} data-status={value}>
      {value === 'COMPLETED' ? <IconCheck size={12} stroke={2.4} /> : value !== 'CANCELLED' && <span className={classes.dot} />}
      {t(`enums.missionStatus.${value}`)}
    </Tag>
  );
}

export function BusinessUnitBadge({ value, size = 'sm' }: { value: BusinessUnit; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Tag size={size} className={classes.unit}>
      {t(`enums.businessUnit.${value}`)}
    </Tag>
  );
}

/** A skill level as a label plus five ascending bars (filled up to the level). */
export function SkillLevelBadge({ value, size = 'sm' }: { value: SkillLevel; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Tag size={size} color={`var(--mantine-color-${SKILL_LEVEL_COLORS[value]}-6)`}>
      <LevelDots value={value} />
      <span style={{ color: 'var(--sh-text-2)' }}>{t(`enums.skillLevel.${value}`)}</span>
    </Tag>
  );
}

export function LevelDots({ value }: { value: SkillLevel }) {
  const rank = skillLevelRank(value);
  return (
    <span className={classes.level} aria-hidden="true">
      {SKILL_LEVELS.map((level, index) => (
        <span key={level} className={classes.levelBar} data-on={index < rank || undefined} style={{ height: 4 + index * 2 }} />
      ))}
    </span>
  );
}

export function FormerEmployeeBadge({ departureDate }: { departureDate: string }) {
  const { t } = useTranslation();
  const past = new Date(departureDate) <= new Date();
  return (
    <Tooltip label={t('employees.departureOn', { date: formatDate(departureDate) })}>
      <span>
        <Tag className={past ? classes.former : classes.leaving}>
          <IconDoorExit size={12} />
          {past ? t('employees.former') : t('employees.leaving')}
        </Tag>
      </span>
    </Tooltip>
  );
}

export function OverbookedBadge({ size = 'sm' }: { size?: Size }) {
  const { t } = useTranslation();
  return (
    <Tag size={size} className={classes.warn}>
      <IconAlertTriangle size={12} />
      {t('availability.overbooked')}
    </Tag>
  );
}

/** "5 days off": working days someone is away during a period. */
export function DaysOff({ count, size = 'xs' }: { count: number; size?: Size }) {
  const { t } = useTranslation();
  return (
    <Tag size={size} className={classes.away}>
      <IconBeach size={12} />
      {t('absences.daysOff', { count })}
    </Tag>
  );
}
