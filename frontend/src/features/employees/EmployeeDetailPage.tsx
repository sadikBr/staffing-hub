import { Anchor, Button, Group, Menu, Modal, MultiSelect, Skeleton, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarStats, IconChevronDown, IconDoorExit, IconFileDescription, IconId, IconPencil, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError } from '@/api/errors';
import { employeeApi, useEmployee } from '@/api/hooks/employees';
import { useRoles } from '@/api/hooks/reference';
import type { Employee } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { CommunityBadge, FormerEmployeeBadge, SeniorityBadge, Tag } from '@/components/badges';
import { confirmDelete } from '@/components/confirmDelete';
import { Monogram, PersonCell } from '@/components/EmployeeAvatar';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { DetailItem, Section } from '@/components/Section';
import { formatDate, formatDateTime, fullName } from '@/lib/format';
import NotFoundPage from '@/pages/NotFoundPage';
import { EmployeeAbsences } from './EmployeeAbsences';
import { EmployeeAssignmentsCard } from './EmployeeAssignmentsCard';
import classes from './EmployeeDetailPage.module.css';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeSkillsCard } from './EmployeeSkillsCard';

export default function EmployeeDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = useEmployee(id);
  const { canEdit, canAdmin } = usePermissions();
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
        leading={<Monogram person={data} />}
        title={name}
        meta={
          <Group gap={8}>
            <SeniorityBadge value={data.seniority} size="md" />
            <CommunityBadge value={data.community} size="md" />
            {data.departureDate && <FormerEmployeeBadge departureDate={data.departureDate} />}
            {data.manager && (
              <Text size="sm" c="var(--sh-text-2)">
                {t('employees.reportsToPrefix')}{' '}
                <Anchor component={Link} to={`/employees/${data.manager.id}`} fw={600} underline="always">
                  {fullName(data.manager)}
                </Anchor>
              </Text>
            )}
          </Group>
        }
        actions={
          <>
            <Button variant="default" leftSection={<IconFileDescription size={16} />} component={Link} to={`/employees/${data.id}/profile`}>
              {t('profile.open')}
            </Button>
            <Button
              variant="default"
              leftSection={<IconCalendarStats size={16} />}
              component={Link}
              to={`/availability?search=${encodeURIComponent(name)}&includeFormer=true`}
            >
              {t('employees.checkAvailability')}
            </Button>
            {canEdit && (
            <Button.Group>
              <Button leftSection={<IconPencil size={16} />} onClick={editModal.open}>
                {t('common.edit')}
              </Button>
              <Menu position="bottom-end">
                <Menu.Target>
                  <Button px={10} aria-label={t('common.actions')} style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.25)' }}>
                    <IconChevronDown size={16} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconDoorExit size={16} />} onClick={editModal.open}>
                    {t('employees.recordDeparture')}
                  </Menu.Item>
                  {canAdmin && <Menu.Divider />}
                  {canAdmin && (
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
                  )}
                </Menu.Dropdown>
              </Menu>
            </Button.Group>
            )}
          </>
        }
      />

      {data.departureDate && new Date(data.departureDate) <= new Date() && (
        <div className={classes.notice}>
          <IconDoorExit size={18} stroke={1.6} />
          <Text size="sm">{t('employees.formerNotice', { date: formatDate(data.departureDate) })}</Text>
        </div>
      )}

      <div className={classes.layout}>
        <Stack gap={40} style={{ minWidth: 0 }}>
          <EmployeeSkillsCard employee={data} />
          <EmployeeAssignmentsCard employeeId={data.id} />
          <EmployeeAbsences employeeId={data.id} />
        </Stack>

        <Section title={t('employees.details')} icon={<IconId size={17} stroke={1.8} />} sheet="padded">
          <DetailItem label={t('employees.fields.manager')}>
            {data.manager ? <PersonCell person={data.manager} size="sm" /> : <Text c="dimmed" size="sm">{t('employees.noManager')}</Text>}
          </DetailItem>
          <RolesDetail employee={data} />
          <DetailItem label={t('employees.team.title')}>
            {data.staff.length === 0 ? (
              <Text size="sm" c="dimmed">
                {t('employees.team.empty')}
              </Text>
            ) : (
              <Stack gap="sm" mt={4}>
                {data.staff.map((member) => (
                  <PersonCell key={member.id} person={member} size="sm" />
                ))}
              </Stack>
            )}
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
          <Text size="xs" c="dimmed" mt="xl">
            {t('common.createdOn', { date: formatDateTime(data.createdAt) })} · {t('common.updatedOn', { date: formatDateTime(data.updatedAt) })}
          </Text>
        </Section>
      </div>

      <EmployeeFormModal opened={editing} onClose={editModal.close} employee={data} />
    </>
  );
}

function RolesDetail({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const [opened, { open, close }] = useDisclosure();
  const roles = useRoles();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (opened) setSelected(employee.roles.map((role) => role.id));
  }, [opened, employee.roles]);

  const save = useApiMutation({ mutationFn: employeeApi.setRoles, successMessage: t('employees.roles.updated'), onSuccess: close });

  return (
    <DetailItem
      label={t('employees.columns.roles')}
      action={
        canEdit && (
          <Button size="compact-xs" variant="subtle" color="brand" leftSection={<IconPencil size={12} />} onClick={open}>
            {t('common.edit')}
          </Button>
        )
      }
    >
      {employee.roles.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('employees.roles.empty')}
        </Text>
      ) : (
        <Group gap={6} mt={2}>
          {employee.roles.map((role) => (
            <Tag key={role.id} size="md">
              {role.label}
            </Tag>
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
    </DetailItem>
  );
}

function DetailSkeleton() {
  return (
    <Stack gap="xl">
      <Group gap="lg">
        <Skeleton height={84} width={84} radius={22} />
        <Stack gap={10}>
          <Skeleton height={36} width={320} />
          <Skeleton height={14} width={200} />
        </Stack>
      </Group>
      <div className={classes.layout}>
        <Skeleton height={360} radius="md" />
        <Skeleton height={360} radius="md" />
      </div>
    </Stack>
  );
}
