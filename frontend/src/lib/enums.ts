import type { BusinessUnit, Community, MissionStatus, Seniority, SkillLevel } from '@/api/types';

/**
 * Every value of each backend enum, in display order. `satisfies Record<..., true>` makes the build fail if the
 * backend adds a value that is not listed here.
 */
function values<T extends string>(all: Record<T, true>): T[] {
  return Object.keys(all) as T[];
}

export const SENIORITIES = values<Seniority>({ JUNIOR: true, MID_LEVEL: true, SENIOR: true });

export const COMMUNITIES = values<Community>({
  BEAR: true,
  DRAGON: true,
  EAGLE: true,
  IGUANA: true,
  OWL: true,
  SHARK: true,
  SQUIRREL: true,
  TIGER: true,
  UNICORN: true,
  WOLF: true,
});

/** From lowest to highest. */
export const SKILL_LEVELS = values<SkillLevel>({
  NOVICE: true,
  BEGINNER: true,
  INTERMEDIATE: true,
  ADVANCED: true,
  EXPERT: true,
});

export const MISSION_STATUSES = values<MissionStatus>({
  PROSPECT: true,
  CONFIRMED: true,
  ONGOING: true,
  COMPLETED: true,
  CANCELLED: true,
});

export const BUSINESS_UNITS = values<BusinessUnit>({
  DIGITAL: true,
  DATA: true,
  CLOUD: true,
  INFRASTRUCTURE: true,
  CONSULTING: true,
});

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  NOVICE: 'gray',
  BEGINNER: 'cyan',
  INTERMEDIATE: 'teal',
  ADVANCED: 'indigo',
  EXPERT: 'grape',
};

export const MISSION_STATUS_COLORS: Record<MissionStatus, string> = {
  PROSPECT: 'gray',
  CONFIRMED: 'blue',
  ONGOING: 'teal',
  COMPLETED: 'indigo',
  CANCELLED: 'red',
};

export const SENIORITY_COLORS: Record<Seniority, string> = {
  JUNIOR: 'cyan',
  MID_LEVEL: 'blue',
  SENIOR: 'indigo',
};

export const COMMUNITY_COLORS: Record<Community, string> = {
  BEAR: 'teal',
  DRAGON: 'red',
  EAGLE: 'indigo',
  IGUANA: 'lime',
  OWL: 'violet',
  SHARK: 'blue',
  SQUIRREL: 'yellow',
  TIGER: 'orange',
  UNICORN: 'pink',
  WOLF: 'gray',
};

export function skillLevelRank(level: SkillLevel): number {
  return SKILL_LEVELS.indexOf(level) + 1;
}

/** The community's color, as a CSS color. */
export function communityColor(value: Community): string {
  return `var(--mantine-color-${COMMUNITY_COLORS[value]}-6)`;
}
