import { ActionIcon, Button, Group, Menu, SegmentedControl, Select, Stack, Switch, Text, Tooltip } from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import { IconArrowsSort, IconCalendarStats, IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAvailability } from '@/api/hooks/employees';
import { useCustomers } from '@/api/hooks/reference';
import { useMoveAssignment } from '@/api/hooks/missions';
import { usePermissions } from '@/auth/permissions';
import type { AvailabilitySituation, EmployeeAvailability } from '@/api/types';
import { MissionSelect } from '@/components/MissionSelect';
import { DaysOff, FormerEmployeeBadge, OverbookedBadge, SeniorityBadge } from '@/components/badges';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TablePagination } from '@/components/TablePagination';
import { TableSkeleton } from '@/components/TableSkeleton';
import { TimelineAxis, TimelineLegend, TimelineTrack, type TimelineBar } from '@/components/Timeline';
import { availabilityTone } from '@/lib/availability';
import { addDays, formatPercent, formatPeriod, today } from '@/lib/format';
import { missionColor, shiftWindow, type TimelineWindow } from '@/lib/timeline';
import { orUndefined, useUrlState } from '@/lib/useUrlState';
import { EmployeeFilters } from '../employees/EmployeeFilters';
import { EMPLOYEE_FILTER_KEYS, toEmployeeQuery } from '../employees/employeeFilterQuery';
import classes from './AvailabilityPage.module.css';

const PAGE_SIZE = 25;
/** Filters on what happens during the period, on top of the employee filters. */
const PERIOD_FILTER_KEYS = ['customerId', 'missionId', 'situation'] as const;
const KEYS = [...EMPLOYEE_FILTER_KEYS, ...PERIOD_FILTER_KEYS, 'from', 'to', 'openEnded', 'minAvailability', 'order'] as const;
const SITUATIONS = ['ALL', 'ON_BENCH', 'OVERBOOKED', 'AWAY'] as const;
const ORDERS = ['MOST_AVAILABLE', 'LEAST_AVAILABLE', 'NAME'] as const;
type Order = (typeof ORDERS)[number];
const PRESETS = [
  { key: 'twoWeeks', days: 14 },
  { key: 'month', days: 30 },
  { key: 'quarter', days: 90 },
] as const;
const MIN_AVAILABILITY = ['', '25', '50', '100'] as const;
/** How far an open-ended period is drawn. */
const OPEN_ENDED_DISPLAY_DAYS = 90;

export default function AvailabilityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const url = useUrlState(KEYS);
  const customers = useCustomers();

  const from = url.values.from || today();
  const openEnded = url.values.openEnded === 'true';
  const to = openEnded ? undefined : url.values.to || addDays(from, 29);
  const minAvailability = url.values.minAvailability;
  const range = useMemo<TimelineWindow>(() => ({ from, to: to ?? addDays(from, OPEN_ENDED_DISPLAY_DAYS - 1) }), [from, to]);

  const availability = useAvailability({
    ...toEmployeeQuery(url.values),
    from,
    to,
    minAvailability: minAvailability ? Number(minAvailability) : undefined,
    customerId: orUndefined(url.values.customerId),
    missionId: orUndefined(url.values.missionId),
    situation: orUndefined<AvailabilitySituation>(url.values.situation),
    order: orUndefined<Order>(url.values.order),
    page: url.page,
    size: PAGE_SIZE,
  });

  const order: Order = (ORDERS as readonly string[]).includes(url.values.order) ? (url.values.order as Order) : 'MOST_AVAILABLE';
  const employeeFilterCount = [...EMPLOYEE_FILTER_KEYS, ...PERIOD_FILTER_KEYS].filter((key) => url.values[key]).length;
  const setPreset = (days: number) => url.set({ from: today(), to: addDays(today(), days - 1), openEnded: '' });
  const activePreset = !openEnded && from === today() ? PRESETS.find((preset) => to === addDays(from, preset.days - 1))?.key : undefined;
  const shift = (direction: 1 | -1) => {
    const next = shiftWindow(range, direction, openEnded ? 30 : undefined);
    url.set(openEnded ? { from: next.from } : { from: next.from, to: next.to });
  };

  return (
    <>
      <PageHeader eyebrow={t('nav.sections.staffing')} title={t('availability.title')} description={t('availability.description')} />

      <div className={`sh-sheet ${classes.panel}`}>
      <div className={classes.controls}>
        <div className={classes.period}>
          <Tooltip label={t('availability.previousPeriod')}>
            <ActionIcon size="lg" variant="light" color="brand" onClick={() => shift(-1)} aria-label={t('availability.previousPeriod')}>
              <IconChevronLeft size={18} />
            </ActionIcon>
          </Tooltip>
          {openEnded ? (
            <DateInput
              aria-label={t('availability.from')}
              value={from}
              onChange={(value) => url.set({ from: value ?? '' })}
              valueFormat={`[${t('availability.fromPrefix')}] D MMM YYYY`}
              classNames={{ input: classes.periodInput }}
              variant="unstyled"
            />
          ) : (
            <DatePickerInput
              type="range"
              aria-label={t('availability.period')}
              value={[from, to ?? null]}
              onChange={([start, end]) => {
                if (start && end) url.set({ from: start, to: end });
              }}
              valueFormat="D MMM YYYY"
              labelSeparator="→"
              allowSingleDateInRange
              numberOfColumns={2}
              classNames={{ input: classes.periodInput }}
              variant="unstyled"
            />
          )}
          <Tooltip label={t('availability.nextPeriod')}>
            <ActionIcon size="lg" variant="light" color="brand" onClick={() => shift(1)} aria-label={t('availability.nextPeriod')}>
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </div>

        <Group gap="lg" wrap="wrap">
          <SegmentedControl
            size="xs"
            value={activePreset ?? ''}
            onChange={(value) => {
              const preset = PRESETS.find((candidate) => candidate.key === value);
              if (preset) setPreset(preset.days);
            }}
            data={[
              ...PRESETS.map((preset) => ({ value: preset.key, label: t(`availability.presets.${preset.key}`) })),
              ...(activePreset ? [] : [{ value: '', label: t('availability.presets.custom') }]),
            ]}
          />
          <Switch
            size="sm"
            label={t('availability.openEnded')}
            checked={openEnded}
            onChange={(event) => url.set({ openEnded: event.currentTarget.checked ? 'true' : '', to: '' })}
          />
        </Group>
      </div>

      <div className={classes.quick}>
        <Group gap={8} wrap="nowrap">
          <Text className="sh-label">{t('availability.minAvailability')}</Text>
          <SegmentedControl
            size="xs"
            value={minAvailability}
            onChange={(value) => url.set({ minAvailability: value })}
            data={MIN_AVAILABILITY.map((value) => ({
              value,
              label: value === '' ? t('availability.anyAvailability') : value === '100' ? t('availability.fullyFree') : `${value}%+`,
            }))}
          />
        </Group>
        <Group gap={8} wrap="nowrap">
          <Text className="sh-label">{t('availability.situation.label')}</Text>
          <SegmentedControl
            size="xs"
            value={url.values.situation || 'ALL'}
            onChange={(value) => url.set({ situation: value === 'ALL' ? '' : value })}
            data={SITUATIONS.map((value) => ({ value, label: t(`availability.situation.${value}`) }))}
          />
        </Group>
      </div>

      <div className={classes.filters}>
        <EmployeeFilters
          values={url.values}
          onChange={url.set}
          onClear={() => url.set(Object.fromEntries([...EMPLOYEE_FILTER_KEYS, ...PERIOD_FILTER_KEYS].map((key) => [key, ''])))}
          activeCount={employeeFilterCount}
          extraAdvancedCount={(url.values.customerId ? 1 : 0) + (url.values.missionId ? 1 : 0)}
          extraAdvanced={
            <>
              <Select
                placeholder={t('availability.filters.anyCustomer')}
                aria-label={t('availability.filters.customer')}
                data={(customers.data ?? []).map((customer) => ({ value: customer.id, label: customer.label }))}
                value={url.values.customerId || null}
                onChange={(value) => url.set({ customerId: value ?? '' })}
                clearable
                searchable
              />
              <MissionSelect
                placeholder={t('availability.filters.anyMission')}
                aria-label={t('availability.filters.mission')}
                value={url.values.missionId || null}
                onChange={(value) => url.set({ missionId: value ?? '' })}
              />
            </>
          }
          extra={
            <Menu position="bottom-end" width={230}>
              <Menu.Target>
                <Button variant="subtle" color="gray" leftSection={<IconArrowsSort size={16} />} rightSection={<IconChevronDown size={14} />}>
                  {t(`availability.order.${order}`)}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('common.sortBy')}</Menu.Label>
                {ORDERS.map((value) => (
                  <Menu.Item
                    key={value}
                    onClick={() => url.set({ order: value === 'MOST_AVAILABLE' ? '' : value })}
                    rightSection={value === order ? <IconCheck size={14} /> : undefined}
                  >
                    {t(`availability.order.${value}`)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          }
        />
      </div>
      </div>

      {availability.isPending ? (
        <TableSkeleton />
      ) : availability.isError ? (
        <QueryError error={availability.error} onRetry={() => void availability.refetch()} />
      ) : availability.data.content.length === 0 ? (
        <EmptyState icon={<IconCalendarStats size={26} stroke={1.5} />} title={t('availability.emptyTitle')} description={t('availability.emptyDescription')} />
      ) : (
        <>
          <div className={classes.summary}>
            <Text size="sm" c="var(--sh-text-2)">
              {t('availability.resultsFor', { period: formatPeriod(from, to ?? null), order: t(`availability.order.${order}`) })}
              {openEnded && ` · ${t('availability.openEndedDisplay', { count: OPEN_ENDED_DISPLAY_DAYS })}`}
            </Text>
            <TimelineLegend />
          </div>
          <div className={`sh-sheet ${classes.board}`} style={{ opacity: availability.isPlaceholderData ? 0.55 : 1, transition: 'opacity 150ms' }}>
            <div className={classes.head}>
              <Text className={`sh-label ${classes.headLabel}`}>{t('employees.columns.employee')}</Text>
              <TimelineAxis range={range} />
              <Text className={`sh-label ${classes.headLabel}`} ta="right">
                {t('availability.columns.free')}
              </Text>
            </div>
            {availability.data.content.map((employee) => (
              <AvailabilityRow key={employee.id} employee={employee} range={range} onOpen={() => navigate(`/employees/${employee.id}`)} />
            ))}
          </div>
          <TablePagination page={availability.data.page} onChange={(page) => url.set({ page: page || null })} />
        </>
      )}
    </>
  );
}

function AvailabilityRow({ employee, range, onOpen }: { employee: EmployeeAvailability; range: TimelineWindow; onOpen: () => void }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const moveAssignment = useMoveAssignment();
  const bars = useMemo<TimelineBar[]>(
    () =>
      employee.assignments.map((assignment) => ({
        id: assignment.id,
        start: assignment.startDate,
        end: assignment.endDate,
        rate: assignment.rate,
        label: assignment.mission.label,
        color: missionColor(assignment.mission.id),
        to: `/missions/${assignment.mission.id}`,
        editable: canEdit,
        detail: `${assignment.mission.customer.label} · ${formatPeriod(assignment.startDate, assignment.endDate ?? null)} · ${formatPercent(assignment.rate ?? 100)}`,
      })),
    [employee.assignments, canEdit],
  );
  const absences = useMemo(
    () =>
      employee.absences.map((absence) => ({
        id: absence.id,
        start: absence.startDate,
        end: absence.endDate,
        label: t(`absences.types.${absence.type}`),
      })),
    [employee.absences, t],
  );

  return (
    <div
      className={classes.row}
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen();
      }}
    >
      <div className={classes.person}>
        <PersonCell
          person={employee}
          secondary={
            <Group gap={4} wrap="nowrap" mt={4}>
              <SeniorityBadge value={employee.seniority} size="xs" />
              {employee.departureDate && <FormerEmployeeBadge departureDate={employee.departureDate} />}
            </Group>
          }
        />
      </div>
      <div className={classes.track}>
        <TimelineTrack
          range={range}
          bars={bars}
          absences={absences}
          highlightOverbooked
          onBarMove={(bar, change) => {
            const assignment = employee.assignments.find((candidate) => candidate.id === bar.id)!;
            return moveAssignment.mutateAsync({
              id: assignment.mission.id,
              assignmentId: assignment.id,
              body: { startDate: change.start, endDate: change.end ?? undefined, version: assignment.version },
            });
          }}
        />
      </div>
      <Stack gap={4} align="flex-end" className={classes.free}>
        <Text component="span" className={`${classes.freeValue} tabular-nums`} c={availabilityTone(employee.availability)}>
          {formatPercent(employee.availability)}
        </Text>
        {employee.overbooked ? (
          <OverbookedBadge size="xs" />
        ) : (
          employee.absentDays > 0 && <DaysOff count={employee.absentDays} />
        )}
      </Stack>
    </div>
  );
}
