import { ActionIcon, Button, Group, Loader, Menu, Modal, Select, Skeleton, Stack, Text, TextInput, Tooltip, UnstyledButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconCode, IconDots, IconPencil, IconPlus, IconSearch, IconTrash, IconUsers, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { skillApi, technologyApi, useTechnologies } from '@/api/hooks/reference';
import type { Skill, TechnologyWithSkills } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { confirmDelete } from '@/components/confirmDelete';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { LabelFormModal } from './LabelFormModal';
import classes from './TechnologiesPage.module.css';

type FormRef = { setErrors: (errors: Record<string, string>) => void } | undefined;

export default function TechnologiesPage() {
  const { t } = useTranslation();
  const technologies = useTechnologies();
  const { canAdmin } = usePermissions();
  const [search, setSearch] = useState('');
  const [technologyModal, technologyModalHandlers] = useDisclosure();
  const [editingTechnology, setEditingTechnology] = useState<TechnologyWithSkills>();
  const [editingSkill, setEditingSkill] = useState<Skill>();
  const technologyFormRef = useRef<FormRef>(undefined);

  const saveTechnology = useApiMutation({
    mutationFn: ({ id, label, version }: { id?: string; label: string; version?: number }) =>
      id ? technologyApi.update({ id, body: { label, version } }) : technologyApi.create({ label }),
    successMessage: (_, { id }) => (id ? t('technologies.updated') : t('technologies.created')),
    onSuccess: technologyModalHandlers.close,
    form: { setErrors: (errors) => technologyFormRef.current?.setErrors(errors) },
  });
  const removeTechnology = useApiMutation({ mutationFn: technologyApi.remove, successMessage: t('technologies.deleted') });
  const removeSkill = useApiMutation({ mutationFn: skillApi.remove, successMessage: t('skills.deleted') });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return technologies.data ?? [];
    return (technologies.data ?? [])
      .map((technology) =>
        technology.label.toLowerCase().includes(term)
          ? technology
          : { ...technology, skills: technology.skills.filter((skill) => skill.label.toLowerCase().includes(term)) },
      )
      .filter((technology) => technology.label.toLowerCase().includes(term) || technology.skills.length > 0);
  }, [technologies.data, search]);

  const openCreate = () => {
    setEditingTechnology(undefined);
    technologyModalHandlers.open();
  };

  return (
    <>
      <PageHeader
        eyebrow={t('nav.sections.referenceData')}
        title={t('technologies.title')}
        description={t('technologies.description')}
        actions={
          canAdmin && (
            <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
              {t('technologies.new')}
            </Button>
          )
        }
      />

      <Group justify="space-between" mb="md" gap="sm" className={`sh-sheet ${classes.toolbar}`}>
        <TextInput
          placeholder={t('technologies.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={{ base: '100%', sm: 360 }}
          aria-label={t('common.search')}
        />
        {technologies.data && (
          <Text size="sm" c="dimmed" pr={6}>
            {t('technologies.summary', {
              technologies: technologies.data.length,
              skills: technologies.data.reduce((sum, technology) => sum + technology.skills.length, 0),
            })}
          </Text>
        )}
      </Group>

      {technologies.isPending ? (
        <Stack gap="md">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} height={88} radius="md" />
          ))}
        </Stack>
      ) : technologies.isError ? (
        <QueryError error={technologies.error} onRetry={() => void technologies.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconCode size={26} stroke={1.5} />}
          title={search ? t('common.noResults') : t('technologies.emptyTitle')}
          description={search ? undefined : t('technologies.emptyDescription')}
          action={
            !search && canAdmin && (
              <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
                {t('technologies.new')}
              </Button>
            )
          }
        />
      ) : (
        <div className={`sh-sheet ${classes.list}`}>
          {filtered.map((technology) => (
            <TechnologyRow
              key={technology.id}
              technology={technology}
              onRename={() => {
                setEditingTechnology(technology);
                technologyModalHandlers.open();
              }}
              onDelete={() =>
                confirmDelete({
                  title: t('technologies.deleteTitle'),
                  message: t('technologies.deleteMessage', { label: technology.label, count: technology.skills.length }),
                  onConfirm: () => removeTechnology.mutate(technology.id),
                })
              }
              onEditSkill={setEditingSkill}
              onDeleteSkill={(skill) =>
                confirmDelete({
                  title: t('skills.deleteTitle'),
                  message: t('skills.deleteMessage', { label: skill.label }),
                  onConfirm: () => removeSkill.mutate(skill.id),
                })
              }
            />
          ))}
        </div>
      )}

      <LabelFormModal
        opened={technologyModal}
        onClose={technologyModalHandlers.close}
        title={editingTechnology ? t('technologies.editTitle') : t('technologies.createTitle')}
        fieldLabel={t('technologies.name')}
        placeholder={t('technologies.namePlaceholder')}
        record={editingTechnology}
        submitting={saveTechnology.isPending}
        onSubmit={(values, form) => {
          technologyFormRef.current = form;
          saveTechnology.mutate({ id: editingTechnology?.id, ...values });
        }}
      />

      <SkillEditModal skill={editingSkill} technologies={technologies.data ?? []} onClose={() => setEditingSkill(undefined)} />
    </>
  );
}

interface TechnologyRowProps {
  technology: TechnologyWithSkills;
  onRename: () => void;
  onDelete: () => void;
  onEditSkill: (skill: Skill) => void;
  onDeleteSkill: (skill: Skill) => void;
}

/** A technology on one line: its name, then its skills as chips, then a field to add one. */
function TechnologyRow({ technology, onRename, onDelete, onEditSkill, onDeleteSkill }: TechnologyRowProps) {
  const { t } = useTranslation();
  const { canAdmin } = usePermissions();
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState<string>();

  const addSkill = useApiMutation({
    mutationFn: (label: string) => skillApi.create({ label, technologyId: technology.id }),
    successMessage: t('skills.created'),
    onSuccess: () => setNewSkill(''),
    form: { setErrors: (errors) => setError(errors.label) },
  });

  const submit = () => {
    const label = newSkill.trim();
    if (!label) return;
    setError(undefined);
    addSkill.mutate(label);
  };

  return (
    <div className={classes.row}>
      <div className={classes.name}>
        <Text className="sh-serif" fz={24} fw={420} lh={1.1}>
          {technology.label}
        </Text>
        <Text size="xs" c="dimmed" mt={6}>
          {t('technologies.skillCount', { count: technology.skills.length })}
        </Text>
      </div>

      <div className={classes.skills}>
        {technology.skills.map((skill) => (
          <span key={skill.id} className={classes.skill}>
            <UnstyledButton
              className={classes.skillLabel}
              onClick={() => onEditSkill(skill)}
              disabled={!canAdmin}
              aria-label={`${t('common.edit')}: ${skill.label}`}
            >
              {skill.label}
            </UnstyledButton>
            {canAdmin && (
            <Tooltip label={t('common.delete')}>
              <UnstyledButton className={classes.skillRemove} onClick={() => onDeleteSkill(skill)} aria-label={`${t('common.delete')}: ${skill.label}`}>
                <IconX size={12} stroke={2.2} />
              </UnstyledButton>
            </Tooltip>
            )}
          </span>
        ))}
        {canAdmin && (
        <Tooltip label={error} opened={Boolean(error)} color="red" position="bottom-start">
          <TextInput
            size="xs"
            variant="unstyled"
            classNames={{ input: classes.addInput }}
            placeholder={t('skills.addPlaceholder')}
            value={newSkill}
            error={Boolean(error)}
            maxLength={255}
            leftSection={<IconPlus size={13} color="var(--sh-primary-text)" />}
            leftSectionWidth={26}
            rightSection={addSkill.isPending ? <Loader size={12} /> : undefined}
            aria-label={t('skills.addPlaceholder')}
            onChange={(event) => {
              setNewSkill(event.currentTarget.value);
              setError(undefined);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
              if (event.key === 'Escape') setNewSkill('');
            }}
            w={newSkill ? Math.min(260, 70 + newSkill.length * 8) : 150}
          />
        </Tooltip>
        )}
      </div>

      <Group gap={2} wrap="nowrap" className={classes.rowActions}>
        <Tooltip label={t('technologies.viewEmployees')}>
          <ActionIcon component={Link} to={`/employees?technologyId=${technology.id}`} aria-label={t('technologies.viewEmployees')}>
            <IconUsers size={17} />
          </ActionIcon>
        </Tooltip>
        {canAdmin && (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon aria-label={t('common.actions')}>
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={onRename}>
              {t('technologies.rename')}
            </Menu.Item>
            <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onDelete}>
              {t('common.delete')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        )}
      </Group>
    </div>
  );
}

function SkillEditModal({ skill, technologies, onClose }: { skill?: Skill; technologies: TechnologyWithSkills[]; onClose: () => void }) {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: { label: '', technologyId: '' },
    validate: {
      label: (value) => (value.trim() ? null : t('validation.required')),
      technologyId: (value) => (value ? null : t('validation.required')),
    },
  });

  useEffect(() => {
    if (skill) {
      form.setValues({ label: skill.label, technologyId: skill.technologyId });
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when another skill is opened
  }, [skill]);

  const save = useApiMutation({
    mutationFn: (values: { label: string; technologyId: string }) =>
      skillApi.update({ id: skill!.id, body: { ...values, version: skill!.version } }),
    successMessage: t('skills.updated'),
    onSuccess: onClose,
    form,
  });

  return (
    <Modal opened={Boolean(skill)} onClose={onClose} title={t('skills.editTitle')}>
      <form onSubmit={form.onSubmit((values) => save.mutate({ ...values, label: values.label.trim() }))}>
        <Stack>
          <TextInput label={t('skills.name')} withAsterisk data-autofocus maxLength={255} {...form.getInputProps('label')} />
          <Select
            label={t('skills.technology')}
            description={t('skills.technologyHelp')}
            withAsterisk
            data={technologies.map((technology) => ({ value: technology.id, label: technology.label }))}
            allowDeselect={false}
            {...form.getInputProps('technologyId')}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={save.isPending}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
