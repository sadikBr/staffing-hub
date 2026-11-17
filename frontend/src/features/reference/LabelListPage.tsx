import { ActionIcon, Button, Card, Group, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiMutation } from '@/api/useApiMutation';
import { confirmDelete } from '@/components/confirmDelete';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TableSkeleton } from '@/components/TableSkeleton';
import { formatDate } from '@/lib/format';
import { LabelFormModal, type LabelledRecord } from './LabelFormModal';

export interface LabelListTexts {
  title: string;
  description: string;
  newButton: string;
  createTitle: string;
  editTitle: string;
  fieldLabel: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  created: string;
  updated: string;
  deleted: string;
  deleteTitle: string;
  deleteMessage: (label: string) => string;
}

interface LabelListPageProps<T extends LabelledRecord & { updatedAt: string }> {
  icon: ReactNode;
  texts: LabelListTexts;
  query: UseQueryResult<T[]>;
  api: {
    create: (body: { label: string }) => Promise<unknown>;
    update: (args: { id: string; body: { label: string; version?: number } }) => Promise<unknown>;
    remove: (id: string) => Promise<unknown>;
  };
  /** Extra actions per row (e.g. "View missions" for a customer). */
  rowActions?: (record: T) => ReactNode;
}

/** A searchable list of labelled records with create, rename and delete. */
export function LabelListPage<T extends LabelledRecord & { updatedAt: string }>({ icon, texts, query, api, rowActions }: LabelListPageProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [opened, { open, close }] = useDisclosure();
  const [editing, setEditing] = useState<T>();
  const formRef = useRef<{ setErrors: (errors: Record<string, string>) => void }>(undefined);

  const save = useApiMutation({
    mutationFn: ({ id, label, version }: { id?: string; label: string; version?: number }) =>
      id ? api.update({ id, body: { label, version } }) : api.create({ label }),
    successMessage: (_, { id }) => (id ? texts.updated : texts.created),
    onSuccess: close,
    form: { setErrors: (errors) => formRef.current?.setErrors(errors) },
  });
  const remove = useApiMutation({ mutationFn: api.remove, successMessage: texts.deleted });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data ?? []).filter((record) => record.label.toLowerCase().includes(term));
  }, [query.data, search]);

  const openCreate = () => {
    setEditing(undefined);
    open();
  };
  const openEdit = (record: T) => {
    setEditing(record);
    open();
  };

  return (
    <>
      <PageHeader
        title={texts.title}
        description={texts.description}
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
            {texts.newButton}
          </Button>
        }
      />

      <Card padding={0}>
        <Group p="md" style={{ borderBottom: '1px solid var(--app-border)' }}>
          <TextInput
            placeholder={texts.searchPlaceholder}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={{ base: '100%', sm: 320 }}
          />
        </Group>

        {query.isPending ? (
          <TableSkeleton columns={3} />
        ) : query.isError ? (
          <div style={{ padding: 'var(--mantine-spacing-md)' }}>
            <QueryError error={query.error} onRetry={() => void query.refetch()} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={icon}
            title={search ? t('common.noResults') : texts.emptyTitle}
            description={search ? undefined : texts.emptyDescription}
            action={
              !search && (
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openCreate}>
                  {texts.newButton}
                </Button>
              )
            }
          />
        ) : (
          <Table.ScrollContainer minWidth={480}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{texts.fieldLabel}</Table.Th>
                  <Table.Th visibleFrom="sm">{t('reference.lastUpdated')}</Table.Th>
                  <Table.Th w={1} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((record) => (
                  <Table.Tr key={record.id}>
                    <Table.Td>
                      <Group gap="sm" wrap="nowrap">
                        <Text c="dimmed" display="flex">
                          {icon}
                        </Text>
                        <Text fw={500}>{record.label}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td visibleFrom="sm">
                      <Text size="sm" c="dimmed">
                        {formatDate(record.updatedAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap" justify="flex-end">
                        {rowActions?.(record)}
                        <Tooltip label={t('common.edit')}>
                          <ActionIcon onClick={() => openEdit(record)} aria-label={t('common.edit')}>
                            <IconPencil size={17} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('common.delete')}>
                          <ActionIcon
                            color="red"
                            aria-label={t('common.delete')}
                            onClick={() =>
                              confirmDelete({
                                title: texts.deleteTitle,
                                message: texts.deleteMessage(record.label),
                                onConfirm: () => remove.mutate(record.id),
                              })
                            }
                          >
                            <IconTrash size={17} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <LabelFormModal
        opened={opened}
        onClose={close}
        title={editing ? texts.editTitle : texts.createTitle}
        fieldLabel={texts.fieldLabel}
        placeholder={texts.placeholder}
        record={editing}
        submitting={save.isPending}
        onSubmit={(values, form) => {
          formRef.current = form;
          save.mutate({ id: editing?.id, ...values });
        }}
      />
    </>
  );
}
