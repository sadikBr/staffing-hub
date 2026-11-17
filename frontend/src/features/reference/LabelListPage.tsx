import { ActionIcon, Button, Group, Text, TextInput, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { confirmDelete } from '@/components/confirmDelete';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { TableSkeleton } from '@/components/TableSkeleton';
import { formatDate } from '@/lib/format';
import { LabelFormModal, type LabelledRecord } from './LabelFormModal';
import classes from './LabelListPage.module.css';

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
  const { canAdmin } = usePermissions();
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

  const groups = useMemo(() => {
    const byLetter = new Map<string, T[]>();
    for (const record of [...filtered].sort((a, b) => a.label.localeCompare(b.label))) {
      const first = record.label.trim().charAt(0).toLocaleUpperCase();
      const letter = /\p{L}/u.test(first) ? first.normalize('NFD').charAt(0) : '#';
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), record]);
    }
    return [...byLetter.entries()];
  }, [filtered]);

  return (
    <>
      <PageHeader
        eyebrow={t('nav.sections.referenceData')}
        title={texts.title}
        description={texts.description}
        actions={
          canAdmin && (
            <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
              {texts.newButton}
            </Button>
          )
        }
      />

      <Group justify="space-between" mb="md" gap="sm" className={`sh-sheet ${classes.toolbar}`}>
        <TextInput
          placeholder={texts.searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={{ base: '100%', sm: 340 }}
          aria-label={t('common.search')}
        />
        {query.data && (
          <Text size="sm" c="dimmed" pr={6}>
            {t('reference.count', { count: filtered.length })}
          </Text>
        )}
      </Group>

      <div className={`sh-sheet ${classes.sheet}`}>
      {query.isPending ? (
        <TableSkeleton columns={2} />
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => void query.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={icon}
          title={search ? t('common.noResults') : texts.emptyTitle}
          description={search ? undefined : texts.emptyDescription}
          action={
            !search && canAdmin && (
              <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
                {texts.newButton}
              </Button>
            )
          }
        />
      ) : (
        <div>
          {groups.map(([letter, records]) => (
            <div key={letter} className={classes.group}>
              <div className={classes.letter} aria-hidden="true">
                {letter}
              </div>
              <ul className={classes.items}>
                {records.map((record) => (
                  <li key={record.id} className={classes.item}>
                    <Text fw={550} truncate style={{ flex: 1, minWidth: 0 }}>
                      {record.label}
                    </Text>
                    <Text size="xs" c="dimmed" visibleFrom="sm">
                      {t('reference.updatedOn', { date: formatDate(record.updatedAt) })}
                    </Text>
                    <Group gap={2} wrap="nowrap" className={classes.actions}>
                      {rowActions?.(record)}
                      {canAdmin && (
                      <>
                      <Tooltip label={t('common.edit')}>
                        <ActionIcon onClick={() => openEdit(record)} aria-label={t('common.edit')}>
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t('common.delete')}>
                        <ActionIcon
                          aria-label={t('common.delete')}
                          onClick={() =>
                            confirmDelete({
                              title: texts.deleteTitle,
                              message: texts.deleteMessage(record.label),
                              onConfirm: () => remove.mutate(record.id),
                            })
                          }
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                      </>
                      )}
                    </Group>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      </div>

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
