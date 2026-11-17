import { describe, expect, it } from 'vitest';
import { formatPercent, formatPeriod, fullName, initials } from './format';

describe('format', () => {
  it('formats periods, including open-ended and unscheduled ones', () => {
    expect(formatPeriod('2026-01-01', '2026-03-31')).toBe('1 Jan 2026 – 31 Mar 2026');
    expect(formatPeriod('2026-01-01', null)).toBe('From 1 Jan 2026');
    expect(formatPeriod(null, '2026-03-31')).toBe('Until 31 Mar 2026');
    expect(formatPeriod(null, undefined)).toBe('Not scheduled');
  });

  it('formats percentages without useless decimals', () => {
    expect(formatPercent(50)).toBe('50%');
    expect(formatPercent(62.5)).toBe('62.5%');
    expect(formatPercent(undefined)).toBe('—');
  });

  it('builds names and initials', () => {
    const person = { firstName: 'ada', lastName: 'Lovelace' };
    expect(fullName(person)).toBe('ada Lovelace');
    expect(initials(person)).toBe('AL');
  });
});
