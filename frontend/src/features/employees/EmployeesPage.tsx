import { Badge, Button, Card, Group, Select, Table, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useEmployees } from '@/api/hooks/employees';
import type { Employee } from '@/api/types';
import { CommunityBadge, FormerEmployeeBadge, SeniorityBadge } from '@/components/badges';
import { EmptyState } from '@/components/EmptyState';
import { PersonCell } from '@/components/EmployeeAvatar';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TablePagination } from '@/components/TablePagination';
import { TableSkeleton } from '@/components/TableSkeleton';
import { fullName } from '@/lib/format';
import { useUrlState } from '@/lib/useUrlState';
import { EmployeeFilters } from './EmployeeFilters';
import { EMPLOYEE_FILTER_KEYS, toEmployeeQuery } from './employeeFilterQuery';
import { EmployeeFormModal } from './EmployeeFormModal';

const PAGE_SIZE = 20;

const SORTS = {
  name: ['lastName,asc', 'firstName,asc'],
  recent: ['updatedAt,desc'],
  seniority: ['seniority,desc', 'lastName,asc'],
} as const;
type SortKey = keyof typeof SORTS;

export default function EmployeesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [creating, { open, close }] = useDisclosure();
  const url = useUrlState([...EMPLOYEE_FILTER_KEYS, 'sort'] as const);
  const sort: SortKey = url.values.sort in SORTS ? (url.values.sort as SortKey) : 'name';

  const employees = useEmployees({
    ...toEmployeeQuery(url.values),
    page: url.page,
    size: PAGE_SIZE,
    sort: [...SORTS[sort]],
  });
  const filterCount = url.activeCount - (url.values.sort ? 1 : 0);

  return (
    <>
      <PageHeader
        title={t('employees.title')}
        description={
          employees.data
            ? t('employees.countDescription', { count: employees.data.page.totalElements })
            : t('employees.description')
        }
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={open}>
            {t('employees.new')}
          </Button>
        }
      />

      <Card padding={0}>
        <div style={{ padding: 'var(--mantine-spacing-md)', borderBottom: '1px solid var(--app-border)' }}>
          <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
            <div style={{ flex: 1 }}>
              <EmployeeFilters values={url.values} onChange={url.set} onClear={url.clear} activeCount={filterCount} />
            </div>
            <Select
              aria-label={t('common.sortBy')}
              data={(Object.keys(SORTS) as SortKey[]).map((key) => ({ value: key, label: t(`employees.sort.${key}`) }))}
              value={sort}
              onChange={(value) => url.set({ sort: value === 'name' ? '' : value })}
              allowDeselect={false}
              w={170}
              visibleFrom="md"
            />
          </Group>
        </div>

        {employees.isPending ? (
          <TableSkeleton />
        ) : employees.isError ? (
          <div style={{ padding: 'var(--mantine-spacing-md)' }}>
            <QueryError error={employees.error} onRetry={() => void employees.refetch()} />
          </div>
        ) : employees.data.content.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={26} />}
            title={filterCount > 0 ? t('employees.emptyFilteredTitle') : t('employees.emptyTitle')}
            description={filterCount > 0 ? t('employees.emptyFilteredDescription') : t('employees.emptyDescription')}
            action={
              filterCount > 0 ? (
                <Button variant="light" onClick={url.clear}>
                  {t('common.clearFilters')}
                </Button>
              ) : (
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={open}>
                  {t('employees.new')}
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table.ScrollContainer minWidth={860}>
              <Table style={{ opacity: employees.isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('employees.columns.employee')}</Table.Th>
                    <Table.Th>{t('employees.fields.seniority')}</Table.Th>
                    <Table.Th>{t('employees.fields.community')}</Table.Th>
                    <Table.Th>{t('employees.columns.roles')}</Table.Th>
                    <Table.Th>{t('employees.columns.technologies')}</Table.Th>
                    <Table.Th ta="right">{t('employees.columns.skills')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {employees.data.content.map((employee) => (
                    <Table.Tr key={employee.id} className="clickable-row" onClick={() => navigate(`/employees/${employee.id}`)}>
                      <Table.Td>
                        <PersonCell
                          person={employee}
                          secondary={
                            employee.manager
                              ? t('employees.reportsTo', { name: fullName(employee.manager) })
                              : t('employees.noManager')
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <SeniorityBadge value={employee.seniority} />
                          {employee.departureDate && <FormerEmployeeBadge departureDate={employee.departureDate} />}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <CommunityBadge value={employee.community} />
                      </Table.Td>
                      <Table.Td>
                        <BadgeList items={employee.roles.map((role) => role.label)} color="gray" />
                      </Table.Td>
                      <Table.Td>
                        <BadgeList items={employee.technologies.map((technology) => technology.label)} color="brand" />
                      </Table.Td>
                      <Table.Td ta="right">
                        <SkillCount employee={employee} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <TablePagination page={employees.data.page} onChange={(page) => url.set({ page: page || null })} />
          </>
        )}
      </Card>

      <EmployeeFormModal opened={creating} onClose={close} />
    </>
  );
}

/** Up to `max` badges, then "+N" with the rest in a tooltip. */
export function BadgeList({ items, color, max = 2 }: { items: string[]; color: string; max?: number }) {
  if (items.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }
  const shown = items.slice(0, max);
  const hidden = items.slice(max);
  return (
    <Group gap={4} wrap="nowrap">
      {shown.map((item) => (
        <Badge key={item} color={color} variant="light" size="sm">
          {item}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip label={hidden.join(', ')}>
          <Badge color="gray" variant="outline" size="sm">
            +{hidden.length}
          </Badge>
        </Tooltip>
      )}
    </Group>
  );
}

function SkillCount({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  if (employee.skills.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }
  return (
    <Tooltip
      label={employee.skills.map((skill) => `${skill.skill.label} (${t(`enums.skillLevel.${skill.level}`)})`).join(', ')}
      multiline
      maw={320}
    >
      <Badge variant="light" color="grape" size="sm">
        {t('employees.skillCount', { count: employee.skills.length })}
      </Badge>
    </Tooltip>
  );
}
