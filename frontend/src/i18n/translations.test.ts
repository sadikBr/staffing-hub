import { describe, expect, it } from 'vitest';
import { BUSINESS_UNITS, COMMUNITIES, MISSION_STATUSES, SENIORITIES, SKILL_LEVELS } from '@/lib/enums';
import en from './locales/en.json';

describe('translations', () => {
  it('have a label for every value of every enum', () => {
    const missing = [
      ...SENIORITIES.filter((value) => !(value in en.enums.seniority)),
      ...COMMUNITIES.filter((value) => !(value in en.enums.community)),
      ...SKILL_LEVELS.filter((value) => !(value in en.enums.skillLevel)),
      ...MISSION_STATUSES.filter((value) => !(value in en.enums.missionStatus)),
      ...BUSINESS_UNITS.filter((value) => !(value in en.enums.businessUnit)),
    ];
    expect(missing).toEqual([]);
  });

  it('contain no empty text', () => {
    const empty: string[] = [];
    const visit = (node: unknown, path: string) => {
      if (typeof node === 'string') {
        if (!node.trim()) empty.push(path);
      } else if (node && typeof node === 'object') {
        Object.entries(node).forEach(([key, value]) => visit(value, path ? `${path}.${key}` : key));
      }
    };
    visit(en, '');
    expect(empty).toEqual([]);
  });
});
