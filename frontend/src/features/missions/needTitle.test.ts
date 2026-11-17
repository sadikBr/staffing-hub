import { describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { needTitle } from './needTitle';

describe('needTitle', () => {
  it('describes a need by its seniority and role', () => {
    const role = { id: 'r', label: 'Developer', version: 0, createdAt: '', updatedAt: '' };
    expect(needTitle({ seniority: 'SENIOR', role }, i18n.t)).toBe('Senior Developer');
    expect(needTitle({ role }, i18n.t)).toBe('Developer');
    expect(needTitle({}, i18n.t)).toBe('Anyone');
  });
});
