import dayjs from 'dayjs';
import { API_DATE_FORMAT } from './format';

/** A period of whole days, both ends included (YYYY-MM-DD). */
export interface TimelineWindow {
  from: string;
  to: string;
}

export interface TimelineItem {
  id: string;
  /** Missing: not scheduled yet. */
  start?: string | null;
  /** Missing: open-ended. */
  end?: string | null;
  /** Share of the person's time, in percent (100 when missing). */
  rate?: number | null;
}

export interface PlacedItem<T extends TimelineItem> {
  item: T;
  /** Position and size, in percent of the range's width. */
  left: number;
  width: number;
  lane: number;
  /** Starts before the range. */
  clippedStart: boolean;
  /** Ends after the range, or has no end. */
  clippedEnd: boolean;
}

export function windowDays(range: TimelineWindow): number {
  return dayjs(range.to).diff(dayjs(range.from), 'day') + 1;
}

/** Days from the range's start to the date (can be negative or beyond the range). */
export function dayOffset(range: TimelineWindow, date: string): number {
  return dayjs(date).diff(dayjs(range.from), 'day');
}

/**
 * Places the scheduled items that overlap the range, clipped to it, and stacks overlapping ones in lanes so that no two
 * bars cover each other. Items without a start date are left out.
 */
export function placeItems<T extends TimelineItem>(range: TimelineWindow, items: T[]): { placed: PlacedItem<T>[]; lanes: number } {
  const days = windowDays(range);
  const visible = items
    .filter((item): item is T & { start: string } => Boolean(item.start))
    .map((item) => {
      const startDay = dayOffset(range, item.start);
      const endDay = item.end ? dayOffset(range, item.end) : Number.POSITIVE_INFINITY;
      return { item, startDay, endDay };
    })
    .filter(({ startDay, endDay }) => endDay >= 0 && startDay < days)
    .sort((a, b) => a.startDay - b.startDay || b.endDay - a.endDay);

  const laneEnds: number[] = [];
  const placed = visible.map(({ item, startDay, endDay }) => {
    const first = Math.max(startDay, 0);
    const last = Math.min(endDay, days - 1);
    let lane = laneEnds.findIndex((laneEnd) => laneEnd < first);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(last);
    } else {
      laneEnds[lane] = last;
    }
    return {
      item,
      left: (first / days) * 100,
      width: ((last - first + 1) / days) * 100,
      lane,
      clippedStart: startDay < 0,
      clippedEnd: endDay > days - 1,
    };
  });
  return { placed, lanes: laneEnds.length };
}

/** The total booked rate on each day of the range, in percent. */
export function dailyLoad(range: TimelineWindow, items: TimelineItem[]): number[] {
  const days = windowDays(range);
  const load = new Array<number>(days).fill(0);
  for (const item of items) {
    if (!item.start) continue;
    const first = Math.max(dayOffset(range, item.start), 0);
    const last = Math.min(item.end ? dayOffset(range, item.end) : days - 1, days - 1);
    for (let day = first; day <= last; day += 1) load[day] += item.rate ?? 100;
  }
  return load;
}

/** Consecutive days sharing the same value, to draw them as one segment. */
export function runs<T>(values: T[]): { value: T; start: number; length: number }[] {
  const result: { value: T; start: number; length: number }[] = [];
  values.forEach((value, index) => {
    const last = result.at(-1);
    if (last && last.value === value) last.length += 1;
    else result.push({ value, start: index, length: 1 });
  });
  return result;
}

export interface Tick {
  day: number;
  label?: string;
  /** A stronger line: the first day of a month or week, depending on the scale. */
  major: boolean;
}

export interface Band {
  day: number;
  length: number;
  label: string;
}

/**
 * Ticks and labelled bands for the axis, depending on how long the range is: days under months for up to 45 days,
 * weeks under months up to 200 days, months under years beyond.
 */
export function ticks(range: TimelineWindow): { ticks: Tick[]; bands: Band[] } {
  const days = windowDays(range);
  const start = dayjs(range.from);
  const long = days > 200;
  const result: Tick[] = [];
  const bands: Band[] = [];

  for (let day = 0; day < days; day += 1) {
    const date = start.add(day, 'day');
    const bandStart = long ? day === 0 || (date.month() === 0 && date.date() === 1) : day === 0 || date.date() === 1;
    if (bandStart) {
      const bandEnd = Math.min((long ? date.endOf('year') : date.endOf('month')).diff(start, 'day'), days - 1);
      bands.push({ day, length: bandEnd - day + 1, label: date.format(long ? 'YYYY' : 'MMM YYYY') });
    }
    if (days <= 45) {
      result.push({ day, label: date.day() === 1 || days <= 16 ? date.format('D') : undefined, major: date.day() === 1 });
    } else if (!long) {
      if (date.day() === 1) result.push({ day, label: date.format('D'), major: false });
    } else if (date.date() === 1) {
      result.push({ day, label: days > 500 && date.month() % 3 !== 0 ? undefined : date.format('MMM'), major: true });
    }
  }
  return { ticks: result, bands };
}

/** Moves the range by its own length (or by `days`), forward or backward. */
export function shiftWindow(range: TimelineWindow, direction: 1 | -1, days = windowDays(range)): TimelineWindow {
  return {
    from: dayjs(range.from).add(direction * days, 'day').format(API_DATE_FORMAT),
    to: dayjs(range.to).add(direction * days, 'day').format(API_DATE_FORMAT),
  };
}

const MISSION_PALETTE = ['indigo', 'teal', 'violet', 'cyan', 'blue', 'grape', 'orange'];

/** A stable color per mission, so the same mission looks the same on every row. */
export function missionColor(missionId: string): string {
  let hash = 0;
  for (const char of missionId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return `var(--mantine-color-${MISSION_PALETTE[Math.abs(hash) % MISSION_PALETTE.length]}-6)`;
}

/** A window around the items and today: from the month of the earliest start to the month after the latest end. */
export function rangeAround(items: TimelineItem[]): TimelineWindow {
  const now = dayjs();
  const starts = items.flatMap((item) => (item.start ? [dayjs(item.start)] : []));
  const ends = items.map((item) => (item.end ? dayjs(item.end) : now.add(60, 'day')));
  const first = [now, ...starts].reduce((min, date) => (date.isBefore(min) ? date : min));
  const last = [now, ...ends].reduce((max, date) => (date.isAfter(max) ? date : max));
  return {
    from: first.subtract(14, 'day').startOf('month').format(API_DATE_FORMAT),
    to: last.add(14, 'day').endOf('month').format(API_DATE_FORMAT),
  };
}
