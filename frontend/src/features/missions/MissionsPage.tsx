import { Avatar, Badge, Button, Card, Group, ScrollArea, SegmentedControl, Select, Stack, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { IconBriefcase, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useDashboard } from '@/api/hooks/dashboard';
import { useMissions } from '@/api/hooks/missions';
import { useCustomers } from '@/api/hooks/reference';
import type { BusinessUnit, Mission, MissionStatus } from '@/api/types';
import { BusinessUnitBadge, MissionStatusBadge } from '@/components/badges';
import { EmployeeAvatar, PersonCell } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TablePagination } from '@/components/TablePagination';
import { TableSkeleton } from '@/components/TableSkeleton';
import { BUSINESS_UNITS, MISSION_STATUSES } from '@/lib/enums';
import { fullName } from '@/lib/format';
import { orUndefined, useUrlState } from '@/lib/useUrlState';
import { MissionFormModal } from './MissionFormModal';

const PAGE_SIZE = 20;
const KEYS = ['search', 'customerId', 'status', 'businessUnit'] as const;

export default function MissionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [creating, { open, close }] = useDisclosure();
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
  const statusLabel = (status: MissionStatus | 'ALL') => {
    const label = status === 'ALL' ? t('missions.allStatuses') : t(`enums.missionStatus.${status}`);
    const count = status === 'ALL' ? total : counts?.[status];
    return count === undefined ? label : `${label} · ${count}`;
  };

  return (
    <>
      <PageHeader
        title={t('missions.title')}
        description={t('missions.description')}
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={open}>
            {t('missions.new')}
          </Button>
        }
      />

      <Card padding={0}>
        <Stack gap="sm" p="md" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <ScrollArea type="never">
            <SegmentedControl
              value={url.values.status || 'ALL'}
              onChange={(value) => url.set({ status: value === 'ALL' ? '' : value })}
              data={(['ALL', ...MISSION_STATUSES] as const).map((status) => ({ value: status, label: statusLabel(status) }))}
            />
          </ScrollArea>
          <Group gap="sm" wrap="wrap">
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
        </Stack>

        {missions.isPending ? (
          <TableSkeleton />
        ) : missions.isError ? (
          <div style={{ padding: 'var(--mantine-spacing-md)' }}>
            <QueryError error={missions.error} onRetry={() => void missions.refetch()} />
          </div>
        ) : missions.data.content.length === 0 ? (
          <EmptyState
            icon={<IconBriefcase size={26} />}
            title={url.activeCount > 0 ? t('missions.emptyFilteredTitle') : t('missions.emptyTitle')}
            description={url.activeCount > 0 ? t('missions.emptyFilteredDescription') : t('missions.emptyDescription')}
            action={
              url.activeCount > 0 ? (
                <Button variant="light" onClick={url.clear}>
                  {t('common.clearFilters')}
                </Button>
              ) : (
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={open}>
                  {t('missions.new')}
                </Button>
              )
            }
          />
        ) : (
          <>
            <Table.ScrollContainer minWidth={900}>
              <Table style={{ opacity: missions.isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('missions.columns.mission')}</Table.Th>
                    <Table.Th>{t('missions.fields.customer')}</Table.Th>
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
                        <Text size="sm" fw={600}>
                          {mission.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {mission.projectName}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{mission.customer.label}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="nowrap">
                          <MissionStatusBadge value={mission.status} />
                          {mission.businessUnit && <BusinessUnitBadge value={mission.businessUnit} />}
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
                            <Badge variant="light" color="grape" size="sm">
                              {t('technologies.skillCount', { count: mission.requiredSkills.length })}
                            </Badge>
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
            <TablePagination page={missions.data.page} onChange={(page) => url.set({ page: page || null })} />
          </>
        )}
      </Card>

      <MissionFormModal opened={creating} onClose={close} defaultCustomerId={url.values.customerId || undefined} />
    </>
  );
}

/** The distinct people assigned to the mission. */
function TeamAvatars({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const people = [...new Map(mission.assignments.map((assignment) => [assignment.employee.id, assignment.employee])).values()];
  if (people.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t('missions.noTeam')}
      </Text>
    );
  }
  const shown = people.slice(0, 4);
  return (
    <Tooltip label={people.map(fullName).join(', ')} multiline maw={300}>
      <Avatar.Group spacing={6}>
        {shown.map((person) => (
          <EmployeeAvatar key={person.id} person={person} size={30} solid />
        ))}
        {people.length > shown.length && (
          <Avatar size={30} radius="xl" style={{ border: '2px solid var(--app-surface)' }}>
            +{people.length - shown.length}
          </Avatar>
        )}
      </Avatar.Group>
    </Tooltip>
  );
}
