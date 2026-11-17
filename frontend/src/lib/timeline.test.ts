import { describe, expect, it } from 'vitest';
import { dailyLoad, placeItems, runs, shiftWindow, ticks, windowDays } from './timeline';

const range = { from: '2026-11-01', to: '2026-11-30' };

describe('timeline', () => {
  it('counts both ends of the range', () => {
    expect(windowDays(range)).toBe(30);
  });

  it('clips items to the range and stacks overlapping ones in lanes', () => {
    const { placed, lanes } = placeItems(range, [
      { id: 'a', start: '2026-10-15', end: '2026-11-10' },
      { id: 'b', start: '2026-11-05', end: null },
      { id: 'c', start: '2026-11-20', end: '2026-11-25' },
      { id: 'unscheduled' },
      { id: 'before', start: '2026-09-01', end: '2026-09-30' },
    ]);

    expect(lanes).toBe(2);
    expect(placed.map((p) => [p.item.id, p.lane, p.clippedStart, p.clippedEnd])).toEqual([
      ['a', 0, true, false],
      ['b', 1, false, true],
      ['c', 0, false, false],
    ]);
    expect(placed[0].left).toBe(0);
    expect(placed[0].width).toBeCloseTo((10 / 30) * 100);
    expect(placed[1].left + placed[1].width).toBeCloseTo(100);
  });

  it('adds up the rates booked on each day', () => {
    const load = dailyLoad(range, [
      { id: 'a', start: '2026-11-01', end: '2026-11-02', rate: 60 },
      { id: 'b', start: '2026-11-02', end: null, rate: 50 },
    ]);
    expect(load.slice(0, 4)).toEqual([60, 110, 50, 50]);
    expect(load).toHaveLength(30);
  });

  it('groups equal consecutive values', () => {
    expect(runs(['a', 'a', 'b', 'a'])).toEqual([
      { value: 'a', start: 0, length: 2 },
      { value: 'b', start: 2, length: 1 },
      { value: 'a', start: 3, length: 1 },
    ]);
  });

  it('labels months and picks a scale from the range length', () => {
    const month = ticks(range);
    expect(month.bands).toEqual([{ day: 0, length: 30, label: 'Nov 2026' }]);
    expect(month.ticks).toHaveLength(30);

    const quarter = ticks({ from: '2026-11-17', to: '2027-02-14' });
    expect(quarter.bands.map((band) => band.label)).toEqual(['Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027']);
    expect(quarter.ticks.every((tick) => !tick.major)).toBe(true);

    // Long ranges: years on top, month names below.
    const year = ticks({ from: '2026-04-01', to: '2027-01-31' });
    expect(year.bands).toEqual([
      { day: 0, length: 275, label: '2026' },
      { day: 275, length: 31, label: '2027' },
    ]);
    expect(year.ticks.map((tick) => tick.label)).toEqual(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']);
  });

  it('moves a range by its own length', () => {
    expect(shiftWindow(range, 1)).toEqual({ from: '2026-12-01', to: '2026-12-30' });
    expect(shiftWindow(range, -1, 7)).toEqual({ from: '2026-10-25', to: '2026-11-23' });
  });
});
