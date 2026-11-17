import { Badge, Button, Card, Grid, Group, SegmentedControl, Stack, Switch, Table, Text, Tooltip } from '@mantine/core';
import { DatePickerInput, DateInput } from '@mantine/dates';
import { IconCalendarStats } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAvailability } from '@/api/hooks/employees';
import type { EmployeeAvailability } from '@/api/types';
import { FormerEmployeeBadge, OverbookedBadge, SeniorityBadge } from '@/components/badges';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { AvailabilityMeter } from '@/components/OccupationBar';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TablePagination } from '@/components/TablePagination';
import { TableSkeleton } from '@/components/TableSkeleton';
import { addDays, formatPercent, formatPeriod, formatShortDate, today } from '@/lib/format';
import { useUrlState } from '@/lib/useUrlState';
import { EmployeeFilters } from '../employees/EmployeeFilters';
import { EMPLOYEE_FILTER_KEYS, toEmployeeQuery } from '../employees/employeeFilterQuery';

const PAGE_SIZE = 20;
const KEYS = [...EMPLOYEE_FILTER_KEYS, 'from', 'to', 'openEnded', 'minAvailability'] as const;
const PRESETS = [
  { key: 'twoWeeks', days: 14 },
  { key: 'month', days: 30 },
  { key: 'quarter', days: 90 },
] as const;
const MIN_AVAILABILITY = ['', '25', '50', '100'] as const;

export default function AvailabilityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const url = useUrlState(KEYS);

  const from = url.values.from || today();
  const openEnded = url.values.openEnded === 'true';
  const to = openEnded ? undefined : url.values.to || addDays(from, 29);
  const minAvailability = url.values.minAvailability;

  const availability = useAvailability({
    ...toEmployeeQuery(url.values),
    from,
    to,
    minAvailability: minAvailability ? Number(minAvailability) : undefined,
    page: url.page,
    size: PAGE_SIZE,
  });

  const employeeFilterCount = EMPLOYEE_FILTER_KEYS.filter((key) => url.values[key]).length;
  const setPreset = (days: number) => url.set({ from: today(), to: addDays(today(), days - 1), openEnded: '' });

  return (
    <>
      <PageHeader title={t('availability.title')} description={t('availability.description')} />

      <Card mb="lg">
        <Grid gutter="md" align="flex-end">
          <Grid.Col span={{ base: 12, md: 5 }}>
            {openEnded ? (
              <DateInput
                label={t('availability.from')}
                value={from}
                onChange={(value) => url.set({ from: value ?? '' })}
                valueFormat="D MMM YYYY"
              />
            ) : (
              <DatePickerInput
                type="range"
                label={t('availability.period')}
                value={[from, to ?? null]}
                onChange={([start, end]) => {
                  if (start && end) url.set({ from: start, to: end });
                }}
                valueFormat="D MMM YYYY"
                allowSingleDateInRange
                numberOfColumns={2}
              />
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group gap={6}>
              {PRESETS.map((preset) => (
                <Button key={preset.key} size="xs" variant="light" color="gray" onClick={() => setPreset(preset.days)}>
                  {t(`availability.presets.${preset.key}`)}
                </Button>
              ))}
            </Group>
            <Switch
              mt="sm"
              size="sm"
              label={t('availability.openEnded')}
              checked={openEnded}
              onChange={(event) => url.set({ openEnded: event.currentTarget.checked ? 'true' : '', to: '' })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Text size="sm" fw={500} mb={4}>
              {t('availability.minAvailability')}
            </Text>
            <SegmentedControl
              fullWidth
              size="xs"
              value={minAvailability}
              onChange={(value) => url.set({ minAvailability: value })}
              data={MIN_AVAILABILITY.map((value) => ({
                value,
                label: value === '' ? t('availability.anyAvailability') : value === '100' ? t('availability.fullyFree') : `${value}%+`,
              }))}
            />
          </Grid.Col>
        </Grid>
      </Card>

      <Card padding={0}>
        <div style={{ padding: 'var(--mantine-spacing-md)', borderBottom: '1px solid var(--app-border)' }}>
          <EmployeeFilters
            values={url.values}
            onChange={url.set}
            onClear={() => url.set(Object.fromEntries(EMPLOYEE_FILTER_KEYS.map((key) => [key, ''])))}
            activeCount={employeeFilterCount}
          />
        </div>

        {availability.isPending ? (
          <TableSkeleton />
        ) : availability.isError ? (
          <div style={{ padding: 'var(--mantine-spacing-md)' }}>
            <QueryError error={availability.error} onRetry={() => void availability.refetch()} />
          </div>
        ) : availability.data.content.length === 0 ? (
          <EmptyState icon={<IconCalendarStats size={26} />} title={t('availability.emptyTitle')} description={t('availability.emptyDescription')} />
        ) : (
          <>
            <Group px="md" pt="md" gap="xs">
              <Text size="sm" c="dimmed">
                {t('availability.resultsFor', { period: formatPeriod(from, to ?? null) })}
              </Text>
            </Group>
            <Table.ScrollContainer minWidth={820}>
              <Table style={{ opacity: availability.isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('employees.columns.employee')}</Table.Th>
                    <Table.Th w={240}>{t('availability.columns.availability')}</Table.Th>
                    <Table.Th>{t('availability.columns.assignments')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {availability.data.content.map((employee) => (
                    <Table.Tr key={employee.id} className="clickable-row" onClick={() => navigate(`/employees/${employee.id}`)}>
                      <Table.Td>
                        <PersonCell
                          person={employee}
                          secondary={
                            <Group gap={4} wrap="nowrap" mt={2}>
                              <SeniorityBadge value={employee.seniority} size="xs" />
                              {employee.departureDate && <FormerEmployeeBadge departureDate={employee.departureDate} />}
                              {employee.overbooked && <OverbookedBadge size="xs" />}
                            </Group>
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <AvailabilityMeter occupation={employee.peakOccupation} availability={employee.availability} />
                      </Table.Td>
                      <Table.Td>
                        <AssignmentChips employee={employee} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <TablePagination page={availability.data.page} onChange={(page) => url.set({ page: page || null })} />
          </>
        )}
      </Card>
    </>
  );
}

function AssignmentChips({ employee }: { employee: EmployeeAvailability }) {
  const { t } = useTranslation();
  if (employee.assignments.length === 0) {
    return (
      <Text size="sm" c="teal" fw={500}>
        {t('availability.noAssignment')}
      </Text>
    );
  }
  return (
    <Stack gap={4}>
      {employee.assignments.map((assignment) => (
        <Tooltip
          key={assignment.id}
          label={`${assignment.mission.customer.label} · ${formatPeriod(assignment.startDate, assignment.endDate ?? null)}`}
        >
          <Badge
            variant="light"
            color="gray"
            size="md"
            radius="sm"
            style={{ fontWeight: 500, maxWidth: 360 }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {assignment.mission.label} · {formatPercent(assignment.rate ?? 100)}
            {assignment.endDate ? ` · ${t('availability.until', { date: formatShortDate(assignment.endDate) })}` : ''}
          </Badge>
        </Tooltip>
      ))}
    </Stack>
  );
}
