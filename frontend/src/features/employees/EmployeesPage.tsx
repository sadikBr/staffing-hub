import { Button, Group, Menu, Stack, Table, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowsSort, IconCheck, IconChevronDown, IconChevronRight, IconPlus, IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useEmployees } from '@/api/hooks/employees';
import { usePermissions } from '@/auth/permissions';
import type { Employee } from '@/api/types';
import { CommunityBadge, FormerEmployeeBadge, SeniorityBadge } from '@/components/badges';
import { PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TablePagination } from '@/components/TablePagination';
import { TableSkeleton } from '@/components/TableSkeleton';
import { SKILL_LEVELS } from '@/lib/enums';
import { fullName } from '@/lib/format';
import { useUrlState } from '@/lib/useUrlState';
import { EmployeeFilters } from './EmployeeFilters';
import { EMPLOYEE_FILTER_KEYS, toEmployeeQuery } from './employeeFilterQuery';
import { EmployeeFormModal } from './EmployeeFormModal';
import classes from './EmployeesPage.module.css';

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
  const { canEdit } = usePermissions();
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
        eyebrow={t('nav.sections.staffing')}
        title={t('employees.title')}
        description={
          employees.data ? t('employees.countDescription', { count: employees.data.page.totalElements }) : t('employees.description')
        }
        actions={
          canEdit && (
            <Button leftSection={<IconPlus size={18} />} onClick={open}>
              {t('employees.new')}
            </Button>
          )
        }
      />

      <div className={`sh-sheet ${classes.toolbar}`}>
        <EmployeeFilters
          values={url.values}
          onChange={url.set}
          onClear={url.clear}
          activeCount={filterCount}
          extra={
            <Menu position="bottom-end" width={220}>
              <Menu.Target>
                <Button variant="subtle" color="gray" leftSection={<IconArrowsSort size={16} />} rightSection={<IconChevronDown size={14} />}>
                  {t(`employees.sort.${sort}`)}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('common.sortBy')}</Menu.Label>
                {(Object.keys(SORTS) as SortKey[]).map((key) => (
                  <Menu.Item
                    key={key}
                    onClick={() => url.set({ sort: key === 'name' ? '' : key })}
                    rightSection={key === sort ? <IconCheck size={14} /> : undefined}
                  >
                    {t(`employees.sort.${key}`)}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          }
        />
      </div>

      <div className={`sh-sheet ${classes.results}`}>
      {employees.isPending ? (
        <TableSkeleton />
      ) : employees.isError ? (
        <QueryError error={employees.error} onRetry={() => void employees.refetch()} />
      ) : employees.data.content.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={26} stroke={1.5} />}
          title={filterCount > 0 ? t('employees.emptyFilteredTitle') : t('employees.emptyTitle')}
          description={filterCount > 0 ? t('employees.emptyFilteredDescription') : t('employees.emptyDescription')}
          action={
            filterCount > 0 ? (
              <Button variant="default" onClick={url.clear}>
                {t('common.clearFilters')}
              </Button>
            ) : (
              canEdit && (
                <Button leftSection={<IconPlus size={16} />} onClick={open}>
                  {t('employees.new')}
                </Button>
              )
            )
          }
        />
      ) : (
        <>
          <Table.ScrollContainer minWidth={900}>
            <Table style={{ opacity: employees.isPlaceholderData ? 0.55 : 1, transition: 'opacity 150ms' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('employees.columns.employee')}</Table.Th>
                  <Table.Th>{t('employees.fields.seniority')}</Table.Th>
                  <Table.Th>{t('employees.fields.community')}</Table.Th>
                  <Table.Th>{t('employees.columns.roles')}</Table.Th>
                  <Table.Th>{t('employees.columns.technologies')}</Table.Th>
                  <Table.Th ta="right">{t('employees.columns.skills')}</Table.Th>
                  <Table.Th w={40} pl={0} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {employees.data.content.map((employee) => (
                  <Table.Tr key={employee.id} className="clickable-row" onClick={() => navigate(`/employees/${employee.id}`)}>
                    <Table.Td>
                      <PersonCell
                        person={employee}
                        secondary={
                          employee.manager ? t('employees.reportsTo', { name: fullName(employee.manager) }) : t('employees.noManager')
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <SeniorityBadge value={employee.seniority} plain />
                        {employee.departureDate && <FormerEmployeeBadge departureDate={employee.departureDate} />}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <CommunityBadge value={employee.community} tinted />
                    </Table.Td>
                    <Table.Td>
                      <InlineList items={employee.roles.map((role) => role.label)} />
                    </Table.Td>
                    <Table.Td>
                      <StackTags items={employee.technologies.map((technology) => technology.label)} />
                    </Table.Td>
                    <Table.Td ta="right">
                      <SkillMix employee={employee} />
                    </Table.Td>
                    <Table.Td w={40} pl={0}>
                      <IconChevronRight size={16} className={classes.chevron} aria-hidden="true" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </>
      )}
      </div>
      {employees.data && <TablePagination page={employees.data.page} onChange={(page) => url.set({ page: page || null })} />}

      <EmployeeFormModal opened={creating} onClose={close} />
    </>
  );
}

function Dash() {
  return (
    <Text size="sm" c="dimmed" component="span">
      —
    </Text>
  );
}

/** "Developer, Tech Lead" in plain text, truncated with the full list in a tooltip. */
function InlineList({ items }: { items: string[] }) {
  if (items.length === 0) return <Dash />;
  return (
    <Tooltip label={items.join(', ')} disabled={items.length < 2} multiline maw={280}>
      <Text size="sm" c="var(--sh-text-2)" maw={200} truncate>
        {items.join(', ')}
      </Text>
    </Tooltip>
  );
}

/** Technologies as small mono tags: up to `max`, then "+N" with the rest in a tooltip. */
export function StackTags({ items, max = 3 }: { items: string[]; max?: number }) {
  if (items.length === 0) return <Dash />;
  const shown = items.slice(0, max);
  const hidden = items.slice(max);
  return (
    <Group gap={4} wrap="nowrap">
      {shown.map((item) => (
        <span key={item} className={classes.stackTag}>
          {item}
        </span>
      ))}
      {hidden.length > 0 && (
        <Tooltip label={hidden.join(', ')}>
          <span className={classes.stackTag} data-more>
            +{hidden.length}
          </span>
        </Tooltip>
      )}
    </Group>
  );
}

/** Shades from novice (light) to expert (deep indigo). */
const LEVEL_SHADES = ['var(--mantine-color-brand-2)', 'var(--mantine-color-brand-3)', 'var(--mantine-color-brand-4)', 'var(--mantine-color-brand-6)', 'var(--mantine-color-brand-8)'];

/** The number of skills, with a bar split by level (novice → expert); the list of skills in a tooltip. */
function SkillMix({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  if (employee.skills.length === 0) return <Dash />;
  const counts = SKILL_LEVELS.map((level) => employee.skills.filter((skill) => skill.level === level).length);
  const sorted = [...employee.skills].sort((a, b) => SKILL_LEVELS.indexOf(b.level) - SKILL_LEVELS.indexOf(a.level));
  return (
    <Tooltip
      label={
        <Stack gap={3}>
          {sorted.map((skill) => (
            <Group key={skill.skill.id} justify="space-between" gap="md" wrap="nowrap">
              <Text size="xs" fw={600}>
                {skill.skill.label}
              </Text>
              <Text size="xs" opacity={0.75}>
                {t(`enums.skillLevel.${skill.level}`)}
              </Text>
            </Group>
          ))}
        </Stack>
      }
      multiline
      miw={200}
    >
      <Group gap={12} wrap="nowrap" justify="flex-end">
        <span className={classes.mix} aria-hidden="true">
          {counts.map((count, index) =>
            count > 0 ? <span key={SKILL_LEVELS[index]} style={{ flexGrow: count, background: LEVEL_SHADES[index] }} /> : null,
          )}
        </span>
        <Text size="sm" fw={600} className="tabular-nums" miw={52} ta="right">
          {t('employees.skillCount', { count: employee.skills.length })}
        </Text>
      </Group>
    </Tooltip>
  );
}
