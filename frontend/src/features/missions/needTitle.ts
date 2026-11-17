import type { TFunction } from 'i18next';
import type { MissionNeed } from '@/api/types';

/** What a need asks for, in a few words: "Senior Developer" or "Anyone". */
export function needTitle(need: Pick<MissionNeed, 'seniority' | 'role'>, t: TFunction): string {
  const parts = [need.seniority ? t(`enums.seniority.${need.seniority}`) : undefined, need.role?.label].filter(Boolean);
  return parts.length ? parts.join(' ') : t('needs.anyone');
}
