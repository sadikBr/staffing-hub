import { Alert, Badge, Button, Grid, Group, Menu, Modal, MultiSelect, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarStats, IconChevronDown, IconDoorExit, IconPencil, IconTrash, IconUsersGroup } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '@/api/errors';
import { employeeApi, useEmployee } from '@/api/hooks/employees';
import { useRoles } from '@/api/hooks/reference';
import type { Employee } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { CommunityBadge, FormerEmployeeBadge, SeniorityBadge } from '@/components/badges';
import { confirmDelete } from '@/components/confirmDelete';
import { EmployeeAvatar, PersonCell } from '@/components/EmployeeAvatar';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { DetailItem, SectionCard } from '@/components/SectionCard';
import { formatDate, formatDateTime, fullName } from '@/lib/format';
import NotFoundPage from '@/pages/NotFoundPage';
import { EmployeeAssignmentsCard } from './EmployeeAssignmentsCard';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeSkillsCard } from './EmployeeSkillsCard';

export default function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = useEmployee(id);
  const [editing, editModal] = useDisclosure();

  const remove = useApiMutation({
    mutationFn: employeeApi.remove,
    successMessage: t('employees.deleted'),
    onSuccess: () => navigate('/employees'),
  });

  if (employee.isPending) return <DetailSkeleton />;
  if (employee.isError) {
    if (employee.error instanceof ApiError && employee.error.status === 404) return <NotFoundPage />;
    return <QueryError error={employee.error} onRetry={() => void employee.refetch()} />;
  }

  const data = employee.data;
  const name = fullName(data);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: t('nav.employees'), to: '/employees' }]}
        leading={<EmployeeAvatar person={data} size={64} />}
        title={name}
        meta={
          <Group gap={6}>
            <SeniorityBadge value={data.seniority} size="md" />
            <CommunityBadge value={data.community} size="md" />
            {data.departureDate && <FormerEmployeeBadge departureDate={data.departureDate} />}
          </Group>
        }
        actions={
          <>
            <Button
              variant="default"
              leftSection={<IconCalendarStats size={16} />}
              component={Link}
              to={`/availability?search=${encodeURIComponent(name)}&includeFormer=true`}
            >
              {t('employees.checkAvailability')}
            </Button>
            <Button.Group>
              <Button leftSection={<IconPencil size={16} />} onClick={editModal.open}>
                {t('common.edit')}
              </Button>
              <Menu position="bottom-end">
                <Menu.Target>
                  <Button px={8} aria-label={t('common.actions')} style={{ borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
                    <IconChevronDown size={16} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconDoorExit size={16} />} onClick={editModal.open}>
                    {t('employees.recordDeparture')}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() =>
                      confirmDelete({
                        title: t('employees.deleteTitle'),
                        message: t('employees.deleteMessage', { name }),
                        onConfirm: () => remove.mutate(data.id),
                      })
                    }
                  >
                    {t('common.delete')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Button.Group>
          </>
        }
      />

      {data.departureDate && new Date(data.departureDate) <= new Date() && (
        <Alert color="gray" icon={<IconDoorExit size={18} />} mb="lg" radius="lg">
          {t('employees.formerNotice', { date: formatDate(data.departureDate) })}
        </Alert>
      )}

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <EmployeeSkillsCard employee={data} />
            <EmployeeAssignmentsCard employeeId={data.id} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard title={t('employees.details')}>
              <Stack gap="md">
                <DetailItem label={t('employees.fields.manager')}>
                  {data.manager ? <PersonCell person={data.manager} size="sm" /> : <Text c="dimmed" size="sm">{t('employees.noManager')}</Text>}
                </DetailItem>
                <DetailItem label={t('employees.fields.departureDate')}>
                  {data.departureDate ? formatDate(data.departureDate) : <Text c="dimmed" size="sm" span>{t('employees.noDeparture')}</Text>}
                </DetailItem>
                <DetailItem label={t('employees.fields.comment')}>
                  {data.comment ? (
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {data.comment}
                    </Text>
                  ) : (
                    <Text c="dimmed" size="sm" span>
                      {t('employees.noComment')}
                    </Text>
                  )}
                </DetailItem>
                <Text size="xs" c="dimmed">
                  {t('common.createdOn', { date: formatDateTime(data.createdAt) })} · {t('common.updatedOn', { date: formatDateTime(data.updatedAt) })}
                </Text>
              </Stack>
            </SectionCard>

            <RolesCard employee={data} />

            <SectionCard
              title={t('employees.team.title')}
              description={t('employees.team.description', { count: data.staff.length })}
              icon={<IconUsersGroup size={18} stroke={1.6} />}
            >
              {data.staff.length === 0 ? (
                <Text size="sm" c="dimmed">
                  {t('employees.team.empty')}
                </Text>
              ) : (
                <Stack gap="sm">
                  {data.staff.map((member) => (
                    <PersonCell key={member.id} person={member} size="sm" />
                  ))}
                </Stack>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>
      </Grid>

      <EmployeeFormModal opened={editing} onClose={editModal.close} employee={data} />
    </>
  );
}

function RolesCard({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure();
  const roles = useRoles();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (opened) setSelected(employee.roles.map((role) => role.id));
  }, [opened, employee.roles]);

  const save = useApiMutation({ mutationFn: employeeApi.setRoles, successMessage: t('employees.roles.updated'), onSuccess: close });

  return (
    <SectionCard
      title={t('employees.columns.roles')}
      actions={
        <Button size="xs" variant="default" leftSection={<IconPencil size={14} />} onClick={open}>
          {t('common.edit')}
        </Button>
      }
    >
      {employee.roles.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('employees.roles.empty')}
        </Text>
      ) : (
        <Group gap={6}>
          {employee.roles.map((role) => (
            <Badge key={role.id} variant="light" color="gray" size="lg" radius="md" style={{ fontWeight: 500 }}>
              {role.label}
            </Badge>
          ))}
        </Group>
      )}

      <Modal opened={opened} onClose={close} title={t('employees.roles.editTitle')}>
        <Stack>
          <MultiSelect
            label={t('employees.columns.roles')}
            placeholder={t('employees.roles.placeholder')}
            data={(roles.data ?? []).map((role) => ({ value: role.id, label: role.label }))}
            value={selected}
            onChange={setSelected}
            searchable
            clearable
            data-autofocus
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button loading={save.isPending} onClick={() => save.mutate({ id: employee.id, roleIds: selected })}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </SectionCard>
  );
}

function DetailSkeleton() {
  return (
    <Stack gap="lg">
      <Group gap="md">
        <Skeleton height={64} circle />
        <Stack gap={8}>
          <Skeleton height={22} width={240} />
          <Skeleton height={14} width={160} />
        </Stack>
      </Group>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Skeleton height={320} radius="lg" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Skeleton height={320} radius="lg" />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
