import { Avatar, Button, Group, Select, Table, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { IconBriefcase, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useDashboard } from '@/api/hooks/dashboard';
import { useMissions } from '@/api/hooks/missions';
import { usePermissions } from '@/auth/permissions';
import { useCustomers } from '@/api/hooks/reference';
import type { BusinessUnit, Mission, MissionStatus } from '@/api/types';
import { BusinessUnitBadge, MissionStatusBadge, Tag } from '@/components/badges';
import { EmployeeAvatar, PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TablePagination } from '@/components/TablePagination';
import { TableSkeleton } from '@/components/TableSkeleton';
import { BUSINESS_UNITS, MISSION_STATUSES } from '@/lib/enums';
import { fullName } from '@/lib/format';
import { missionColor } from '@/lib/timeline';
import { orUndefined, useUrlState } from '@/lib/useUrlState';
import { MissionFormModal } from './MissionFormModal';
import classes from './MissionsPage.module.css';

const PAGE_SIZE = 20;
const KEYS = ['search', 'customerId', 'status', 'businessUnit'] as const;

export default function MissionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [creating, { open, close }] = useDisclosure();
  const { canEdit } = usePermissions();
  const url = useUrlState(KEYS);
  const customers = useCustomers();
  const dashboard = useDashboard();

  const missions = useMissions({
    search: orUndefined(url.values.search),
    customerId: orUndefined(url.values.customerId),
    status: orUndefined<MissionStatus>(url.values.status),
    businessUnit: orUndefined<BusinessUnit>(url.values.businessUnit),
    page: url.page,
    size: PAGE_SIZE,
    sort: ['label,asc'],
  });

  const [search, setSearch] = useState(url.values.search);
  const pushSearch = useDebouncedCallback((value: string) => url.set({ search: value }), 300);
  useEffect(() => setSearch(url.values.search), [url.values.search]);

  const counts = dashboard.data?.missionsByStatus;
  const total = counts ? Object.values(counts).reduce((sum, count) => sum + count, 0) : undefined;
  const current = url.values.status || 'ALL';

  return (
    <>
      <PageHeader
        eyebrow={t('nav.sections.staffing')}
        title={t('missions.title')}
        description={t('missions.description')}
        actions={
          canEdit && (
            <Button leftSection={<IconPlus size={18} />} onClick={open}>
              {t('missions.new')}
            </Button>
          )
        }
      />

      <div className={classes.tabs} role="tablist" aria-label={t('missions.fields.status')}>
        {(['ALL', ...MISSION_STATUSES] as const).map((status) => {
          const count = status === 'ALL' ? total : (counts?.[status] ?? 0);
          return (
            <UnstyledButton
              key={status}
              role="tab"
              aria-selected={current === status}
              className={classes.tab}
              data-active={current === status || undefined}
              onClick={() => url.set({ status: status === 'ALL' ? '' : status })}
            >
              {status === 'ALL' ? t('missions.allStatuses') : t(`enums.missionStatus.${status}`)}
              {count !== undefined && <span className={classes.count}>{count}</span>}
            </UnstyledButton>
          );
        })}
      </div>

      <Group gap="xs" wrap="wrap" mb="md" className={`sh-sheet ${classes.toolbar}`}>
        <TextInput
          placeholder={t('missions.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            pushSearch(event.currentTarget.value);
          }}
          style={{ flex: '1 1 240px' }}
          aria-label={t('common.search')}
        />
        <Select
          placeholder={t('missions.fields.customer')}
          data={(customers.data ?? []).map((customer) => ({ value: customer.id, label: customer.label }))}
          value={url.values.customerId || null}
          onChange={(value) => url.set({ customerId: value ?? '' })}
          clearable
          searchable
          w={{ base: '100%', sm: 220 }}
          aria-label={t('missions.fields.customer')}
        />
        <Select
          placeholder={t('missions.fields.businessUnit')}
          data={BUSINESS_UNITS.map((value) => ({ value, label: t(`enums.businessUnit.${value}`) }))}
          value={url.values.businessUnit || null}
          onChange={(value) => url.set({ businessUnit: value ?? '' })}
          clearable
          w={{ base: '100%', sm: 180 }}
          aria-label={t('missions.fields.businessUnit')}
        />
        {url.activeCount > 0 && (
          <Button variant="subtle" color="gray" leftSection={<IconX size={14} />} onClick={url.clear}>
            {t('common.clearFilters')}
          </Button>
        )}
      </Group>

      <div className={`sh-sheet ${classes.results}`}>
      {missions.isPending ? (
        <TableSkeleton />
      ) : missions.isError ? (
        <QueryError error={missions.error} onRetry={() => void missions.refetch()} />
      ) : missions.data.content.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={26} stroke={1.5} />}
          title={url.activeCount > 0 ? t('missions.emptyFilteredTitle') : t('missions.emptyTitle')}
          description={url.activeCount > 0 ? t('missions.emptyFilteredDescription') : t('missions.emptyDescription')}
          action={
            url.activeCount > 0 ? (
              <Button variant="default" onClick={url.clear}>
                {t('common.clearFilters')}
              </Button>
            ) : (
              canEdit && (
                <Button leftSection={<IconPlus size={16} />} onClick={open}>
                  {t('missions.new')}
                </Button>
              )
            )
          }
        />
      ) : (
        <>
          <Table.ScrollContainer minWidth={880}>
            <Table verticalSpacing="md" style={{ opacity: missions.isPlaceholderData ? 0.55 : 1, transition: 'opacity 150ms' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('missions.columns.mission')}</Table.Th>
                  <Table.Th>{t('missions.fields.status')}</Table.Th>
                  <Table.Th>{t('missions.fields.projectManager')}</Table.Th>
                  <Table.Th>{t('missions.columns.team')}</Table.Th>
                  <Table.Th ta="right">{t('missions.columns.requiredSkills')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {missions.data.content.map((mission) => (
                  <Table.Tr key={mission.id} className="clickable-row" onClick={() => navigate(`/missions/${mission.id}`)}>
                    <Table.Td>
                      <Group gap={14} wrap="nowrap">
                        <span className={classes.swatch} style={{ background: missionColor(mission.id) }} />
                        <div style={{ minWidth: 0 }}>
                          <Text fw={650} lh={1.3} truncate>
                            {mission.label}
                          </Text>
                          <Text size="xs" c="dimmed" truncate>
                            {mission.customer.label} · {mission.projectName}
                          </Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <MissionStatusBadge value={mission.status} />
                        {mission.businessUnit && <BusinessUnitBadge value={mission.businessUnit} size="xs" />}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {mission.projectManager ? (
                        <PersonCell person={mission.projectManager} size="sm" />
                      ) : (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <TeamAvatars mission={mission} />
                    </Table.Td>
                    <Table.Td ta="right">
                      {mission.requiredSkills.length > 0 ? (
                        <Tooltip label={mission.requiredSkills.map((skill) => skill.skill.label).join(', ')} multiline maw={300}>
                          <Text size="sm" fw={600} span>
                            {t('technologies.skillCount', { count: mission.requiredSkills.length })}
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </>
      )}
      </div>
      {missions.data && <TablePagination page={missions.data.page} onChange={(page) => url.set({ page: page || null })} />}

      <MissionFormModal opened={creating} onClose={close} defaultCustomerId={url.values.customerId || undefined} />
    </>
  );
}

/** The distinct people assigned to the mission. */
function TeamAvatars({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const people = [...new Map(mission.assignments.map((assignment) => [assignment.employee.id, assignment.employee])).values()];
  const open = mission.needs.filter((need) => !need.filledBy).length;
  const openTag = open > 0 && (
    <Tag size="xs" className={classes.open}>
      {t('needs.openCount', { count: open })}
    </Tag>
  );
  if (people.length === 0) {
    return (
      <Group gap={8} wrap="nowrap">
        <Text size="sm" c="dimmed">
          {t('missions.noTeam')}
        </Text>
        {openTag}
      </Group>
    );
  }
  const shown = people.slice(0, 4);
  return (
    <Group gap={8} wrap="nowrap">
    <Tooltip label={people.map(fullName).join(', ')} multiline maw={300}>
      <Avatar.Group spacing={6}>
        {shown.map((person) => (
          <EmployeeAvatar key={person.id} person={person} size={32} solid />
        ))}
        {people.length > shown.length && (
          <Avatar size={32} radius="xl" style={{ border: '2px solid var(--sh-bg)' }}>
            +{people.length - shown.length}
          </Avatar>
        )}
      </Avatar.Group>
    </Tooltip>
    {openTag}
    </Group>
  );
}
