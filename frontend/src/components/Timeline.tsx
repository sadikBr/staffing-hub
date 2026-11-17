import { Stack, Text, Tooltip } from '@mantine/core';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { API_DATE_FORMAT, formatPercent, formatPeriod, today } from '@/lib/format';
import { dailyLoad, dayOffset, placeItems, runs, ticks, windowDays, type TimelineItem, type TimelineWindow } from '@/lib/timeline';
import classes from './Timeline.module.css';

const BAR_HEIGHT = 26;
const LANE_GAP = 4;
const PADDING = 7;

export interface TimelineBar extends TimelineItem {
  label: string;
  /** CSS color of the bar. */
  color: string;
  /** Shown in the tooltip. */
  detail?: ReactNode;
  /** Where clicking the bar leads. */
  to?: string;
  /** Can be moved and resized by dragging (when the track has {@code onBarMove}). */
  editable?: boolean;
}

function pct(value: number) {
  return `${value}%`;
}

/** Month names and day/week numbers above timeline tracks. Must sit in a column as wide as the tracks. */
export function TimelineAxis({ range }: { range: TimelineWindow }) {
  const { t } = useTranslation();
  const days = windowDays(range);
  const { ticks: tickList, bands } = useMemo(() => ticks(range), [range]);
  const todayDay = dayOffset(range, today());
  // Week and month ticks are labelled from their first day; day ticks are centered on the day.
  const weekScale = days > 45;

  return (
    <div className={classes.axis} aria-hidden="true">
      {bands.map((band) => (
        <div key={band.day} className={classes.month} style={{ left: pct((band.day / days) * 100), width: pct((band.length / days) * 100) }}>
          {band.length / days > 0.06 || bands.length === 1 ? band.label : ''}
        </div>
      ))}
      {tickList
        // Hide the labels the "Today" flag would cover.
        .filter((tick) => tick.label && !(todayDay >= 0 && todayDay < days && Math.abs(tick.day - todayDay) / days < 0.035))
        .map((tick) => (
          <span
            key={tick.day}
            className={classes.tickLabel}
            data-major={tick.major || undefined}
            data-align={weekScale ? 'start' : undefined}
            style={{ left: pct(((weekScale ? tick.day : tick.day + 0.5) / days) * 100) }}
          >
            {tick.label}
          </span>
        ))}
      {todayDay >= 0 && todayDay < days && (
        <span className={classes.todayFlag} style={{ left: pct(((todayDay + 0.5) / days) * 100) }}>
          {t('timeline.today')}
        </span>
      )}
    </div>
  );
}

/** A period the person is away, drawn behind the bars. */
export interface TimelineAbsence {
  id: string;
  start: string;
  end: string;
  label: string;
}

/** New dates for a bar after it was dragged. {@code end} null: ongoing. */
export interface BarMove {
  start: string;
  end: string | null;
}

interface TimelineTrackProps {
  range: TimelineWindow;
  bars: TimelineBar[];
  /** Tint the days on which the bars add up to more than 100%. */
  highlightOverbooked?: boolean;
  /** Bars for items without a start date, drawn as placeholders across the range. */
  showUnscheduled?: boolean;
  absences?: TimelineAbsence[];
  /**
   * Called when an editable bar is dragged (moved, or resized from either edge). The bar keeps its new place while
   * the returned promise is pending, and goes back if it fails.
   */
  onBarMove?: (bar: TimelineBar, move: BarMove) => Promise<unknown>;
}

/** One row of a timeline: a lane with bars placed by date, stacked when they overlap. */
export function TimelineTrack({ range, bars, highlightOverbooked = false, showUnscheduled = false, absences = [], onBarMove }: TimelineTrackProps) {
  const { t } = useTranslation();
  const days = windowDays(range);
  const trackRef = useRef<HTMLDivElement>(null);

  // Dropped bars stay where they were dropped until the saved data comes back (or the save fails).
  const [moved, setMoved] = useState<Record<string, BarMove>>({});
  const signature = bars.map((bar) => `${bar.id}:${bar.start}:${bar.end}`).join('|');
  useEffect(() => setMoved({}), [signature]);
  const shown = useMemo(
    () => bars.map((bar) => (moved[bar.id] ? { ...bar, start: moved[bar.id].start, end: moved[bar.id].end } : bar)),
    [bars, moved],
  );

  const { placed, lanes } = useMemo(() => placeItems(range, shown), [range, shown]);
  const unscheduled = showUnscheduled ? shown.filter((bar) => !bar.start) : [];
  const overbooked = useMemo(
    () => (highlightOverbooked ? runs(dailyLoad(range, shown).map((load) => load > 100)).filter((run) => run.value) : []),
    [highlightOverbooked, range, shown],
  );
  const away = useMemo(() => placeItems(range, absences).placed, [range, absences]);
  const { bands } = useMemo(() => ticks(range), [range]);
  const todayDay = dayOffset(range, today());

  const totalLanes = lanes + unscheduled.length;
  const height = Math.max(totalLanes, 1) * (BAR_HEIGHT + LANE_GAP) - LANE_GAP + PADDING * 2;

  const move = (bar: TimelineBar, change: BarMove) => {
    if (!onBarMove) return;
    setMoved((current) => ({ ...current, [bar.id]: change }));
    onBarMove(bar, change).catch(() =>
      setMoved((current) => {
        const rest = { ...current };
        delete rest[bar.id];
        return rest;
      }),
    );
  };

  return (
    <div className={classes.track} style={{ height }} ref={trackRef}>
      <div className={classes.lane} />
      {away.map(({ item, left, width }) => (
        <Tooltip key={item.id} label={`${item.label} · ${formatPeriod(item.start, item.end)}`}>
          <div className={classes.absence} style={{ left: pct(left), width: pct(width) }}>
            <span>{item.label}</span>
          </div>
        </Tooltip>
      ))}
      {overbooked.map((run) => (
        <Tooltip key={run.start} label={t('timeline.overbookedDays', { count: run.length })}>
          <div className={classes.overBand} style={{ left: pct((run.start / days) * 100), width: pct((run.length / days) * 100) }} />
        </Tooltip>
      ))}
      {bands
        .filter((band) => band.day > 0)
        .map((band) => (
          <div key={band.day} className={classes.gridLine} style={{ left: pct((band.day / days) * 100) }} />
        ))}
      {todayDay >= 0 && todayDay < days && <div className={classes.today} style={{ left: pct(((todayDay + 0.5) / days) * 100) }} />}

      {placed.map(({ item, left, width, lane, clippedStart, clippedEnd }) => (
        <Bar
          key={item.id}
          bar={item}
          left={left}
          width={width}
          top={PADDING + lane * (BAR_HEIGHT + LANE_GAP)}
          clippedStart={clippedStart}
          clippedEnd={clippedEnd}
          range={range}
          trackRef={trackRef}
          onMove={onBarMove && item.editable ? (change) => move(item, change) : undefined}
        />
      ))}
      {unscheduled.map((bar, index) => (
        <Bar
          key={bar.id}
          bar={{ ...bar, label: `${bar.label} · ${t('common.notScheduled')}` }}
          ghost
          left={0}
          width={100}
          top={PADDING + (lanes + index) * (BAR_HEIGHT + LANE_GAP)}
          range={range}
          trackRef={trackRef}
        />
      ))}
    </div>
  );
}

type DragMode = 'move' | 'start' | 'end';

interface BarProps {
  bar: TimelineBar;
  /** Position and size in percent of the track. */
  left: number;
  width: number;
  top: number;
  clippedStart?: boolean;
  clippedEnd?: boolean;
  ghost?: boolean;
  range: TimelineWindow;
  trackRef: React.RefObject<HTMLDivElement | null>;
  /** Set when the bar can be dragged. */
  onMove?: (change: BarMove) => void;
}

function Bar({ bar, left, width, top, clippedStart, clippedEnd, ghost, range, trackRef, onMove }: BarProps) {
  const { t } = useTranslation();
  const [drag, setDrag] = useState<{ mode: DragMode; delta: number }>();
  const dragRef = useRef<{ mode: DragMode; delta: number }>(undefined);
  const justDragged = useRef(false);
  const days = windowDays(range);

  const rate = bar.rate ?? 100;
  // Fuller bars for higher occupation rates.
  const strength = 16 + Math.round(Math.min(rate, 100) * 0.16);

  /** The dates the bar would have after the current drag. */
  const target = (mode: DragMode, delta: number): BarMove | undefined => {
    if (!bar.start) return undefined;
    const start = dayjs(bar.start);
    const end = bar.end ? dayjs(bar.end) : undefined;
    if (mode === 'move') {
      return { start: start.add(delta, 'day').format(API_DATE_FORMAT), end: end ? end.add(delta, 'day').format(API_DATE_FORMAT) : null };
    }
    if (mode === 'start') {
      const newStart = start.add(delta, 'day');
      const latest = end ?? newStart;
      return { start: (newStart.isAfter(latest) ? latest : newStart).format(API_DATE_FORMAT), end: bar.end ?? null };
    }
    // Resizing an ongoing assignment from its end gives it an end date.
    const base = end ?? dayjs(range.to);
    const newEnd = base.add(delta, 'day');
    return { start: bar.start, end: (newEnd.isBefore(start) ? start : newEnd).format(API_DATE_FORMAT) };
  };

  const startDrag = (mode: DragMode) => (event: React.PointerEvent) => {
    if (!onMove || event.button !== 0 || event.pointerType === 'touch' || !trackRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    const trackWidth = trackRef.current.getBoundingClientRect().width;
    const startX = event.clientX;
    dragRef.current = { mode, delta: 0 };
    setDrag(dragRef.current);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const delta = Math.round(((moveEvent.clientX - startX) / trackWidth) * days);
      if (delta !== dragRef.current?.delta) {
        dragRef.current = { mode, delta };
        setDrag(dragRef.current);
      }
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      const finished = dragRef.current;
      dragRef.current = undefined;
      setDrag(undefined);
      if (finished && finished.delta !== 0) {
        justDragged.current = true;
        const change = target(finished.mode, finished.delta);
        if (change && (change.start !== bar.start || change.end !== (bar.end ?? null))) onMove(change);
      }
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // While dragging, the bar follows the pointer by whole days.
  const shift = drag ? (drag.delta / days) * 100 : 0;
  const shownLeft = left + (drag && drag.mode !== 'end' ? shift : 0);
  const shownWidth = width + (drag?.mode === 'start' ? -shift : drag?.mode === 'end' ? shift : 0);
  const preview = drag && drag.delta !== 0 ? target(drag.mode, drag.delta) : undefined;

  const content = (
    <>
      {!ghost && <span className={classes.barDot} />}
      <span className={classes.barLabel}>{bar.label}</span>
      {!ghost && <span className={classes.barRate}>{formatPercent(rate)}</span>}
      {onMove && (
        <>
          <span className={classes.handle} data-side="start" onPointerDown={startDrag('start')} />
          <span className={classes.handle} data-side="end" onPointerDown={startDrag('end')} />
        </>
      )}
    </>
  );
  const common = {
    className: classes.bar,
    'data-clip-start': clippedStart || undefined,
    'data-clip-end': clippedEnd || undefined,
    'data-ghost': ghost || undefined,
    'data-editable': onMove ? true : undefined,
    'data-dragging': drag ? true : undefined,
    style: {
      left: `calc(${pct(shownLeft)} + 1px)`,
      width: `max(calc(${pct(Math.max(shownWidth, 0))} - 2px), 6px)`,
      top,
      '--c': bar.color,
      '--strength': `${strength}%`,
    } as React.CSSProperties,
    onPointerDown: onMove ? startDrag('move') : undefined,
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      // A drag ends with a click: it must not open the bar's link.
      if (justDragged.current) {
        event.preventDefault();
        justDragged.current = false;
      }
    },
  };

  return (
    <>
      {preview && (
        <div className={classes.dragLabel} style={{ left: pct(shownLeft), top: top - 24 }}>
          {formatPeriod(preview.start, preview.end)}
        </div>
      )}
      <Tooltip
        disabled={Boolean(drag)}
        label={
          <Stack gap={2}>
            <Text size="xs" fw={600}>
              {bar.label}
            </Text>
            {bar.detail && (
              <Text size="xs" opacity={0.8} component="div">
                {bar.detail}
              </Text>
            )}
            {onMove && (
              <Text size="xs" opacity={0.6}>
                {t('timeline.dragHint')}
              </Text>
            )}
          </Stack>
        }
        multiline
        maw={300}
      >
        {bar.to ? (
          <Link to={bar.to} draggable={false} {...common}>
            {content}
          </Link>
        ) : (
          <div {...common}>{content}</div>
        )}
      </Tooltip>
    </>
  );
}

/** What the marks on a timeline mean. */
export function TimelineLegend() {
  const { t } = useTranslation();
  return (
    <div className={classes.legend}>
      <span>
        <span className={classes.legendBar} />
        {t('timeline.legend.mission')}
      </span>
      <span>
        <span className={classes.legendAway} />
        {t('timeline.legend.away')}
      </span>
      <span>
        <span className={classes.legendOver} />
        {t('timeline.legend.over')}
      </span>
      <span>
        <span className={classes.legendToday} />
        {t('timeline.today')}
      </span>
    </div>
  );
}
