import dayjs from 'dayjs';
import i18n from '@/i18n';

export const API_DATE_FORMAT = 'YYYY-MM-DD';

export function formatDate(date: string | null | undefined): string {
  return date ? dayjs(date).format('D MMM YYYY') : '';
}

export function formatShortDate(date: string | null | undefined): string {
  return date ? dayjs(date).format('D MMM') : '';
}

/** "1 Jan 2026 – 31 Mar 2026", "From 1 Jan 2026" (ongoing) or "Not scheduled". */
export function formatPeriod(start: string | null | undefined, end: string | null | undefined): string {
  if (!start && !end) return i18n.t('common.notScheduled');
  if (start && !end) return i18n.t('common.fromDate', { date: formatDate(start) });
  if (!start && end) return i18n.t('common.untilDate', { date: formatDate(end) });
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100) / 100}%`;
}

export function formatDateTime(instant: string | null | undefined): string {
  return instant ? dayjs(instant).format('D MMM YYYY, HH:mm') : '';
}

/** Whole days from today to the date (negative when in the past). */
export function daysFromToday(date: string): number {
  return dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');
}

export function today(): string {
  return dayjs().format(API_DATE_FORMAT);
}

export function addDays(date: string, days: number): string {
  return dayjs(date).add(days, 'day').format(API_DATE_FORMAT);
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`;
}

export function initials(person: { firstName: string; lastName: string }): string {
  return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
}
