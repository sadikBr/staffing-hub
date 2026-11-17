import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Modal,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconCode, IconDots, IconPencil, IconPlus, IconSearch, IconTrash, IconUsers } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { skillApi, technologyApi, useTechnologies } from '@/api/hooks/reference';
import type { Skill, TechnologyWithSkills } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { confirmDelete } from '@/components/confirmDelete';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { QueryError } from '@/components/QueryError';
import { LabelFormModal } from './LabelFormModal';

type FormRef = { setErrors: (errors: Record<string, string>) => void } | undefined;

export default function TechnologiesPage() {
  const { t } = useTranslation();
  const technologies = useTechnologies();
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
        title={t('technologies.title')}
        description={t('technologies.description')}
        actions={
          <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>
            {t('technologies.new')}
          </Button>
        }
      />

      <TextInput
        placeholder={t('technologies.searchPlaceholder')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        w={{ base: '100%', sm: 360 }}
        mb="lg"
      />

      {technologies.isPending ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} height={220} radius="lg" />
          ))}
        </SimpleGrid>
      ) : technologies.isError ? (
        <QueryError error={technologies.error} onRetry={() => void technologies.refetch()} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconCode size={26} />}
            title={search ? t('common.noResults') : t('technologies.emptyTitle')}
            description={search ? undefined : t('technologies.emptyDescription')}
            action={
              !search && (
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openCreate}>
                  {t('technologies.new')}
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {filtered.map((technology) => (
            <TechnologyCard
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
        </SimpleGrid>
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

interface TechnologyCardProps {
  technology: TechnologyWithSkills;
  onRename: () => void;
  onDelete: () => void;
  onEditSkill: (skill: Skill) => void;
  onDeleteSkill: (skill: Skill) => void;
}

function TechnologyCard({ technology, onRename, onDelete, onEditSkill, onDeleteSkill }: TechnologyCardProps) {
  const { t } = useTranslation();
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
    <Card>
      <Group justify="space-between" wrap="nowrap" mb="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" size={38} radius="md">
            <IconCode size={20} />
          </ThemeIcon>
          <div>
            <Text fw={650}>{technology.label}</Text>
            <Text size="xs" c="dimmed">
              {t('technologies.skillCount', { count: technology.skills.length })}
            </Text>
          </div>
        </Group>
        <Group gap={4} wrap="nowrap">
          <Tooltip label={t('technologies.viewEmployees')}>
            <ActionIcon component={Link} to={`/employees?technologyId=${technology.id}`} aria-label={t('technologies.viewEmployees')}>
              <IconUsers size={17} />
            </ActionIcon>
          </Tooltip>
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
        </Group>
      </Group>

      <Stack gap={6} mb="md">
        {technology.skills.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('technologies.noSkills')}
          </Text>
        ) : (
          technology.skills.map((skill) => (
            <Group key={skill.id} justify="space-between" wrap="nowrap" className="skill-row">
              <Badge variant="light" color="gray" size="lg" radius="md" style={{ fontWeight: 500 }}>
                {skill.label}
              </Badge>
              <Group gap={2} wrap="nowrap">
                <Tooltip label={t('common.edit')}>
                  <ActionIcon size="sm" onClick={() => onEditSkill(skill)} aria-label={t('common.edit')}>
                    <IconPencil size={15} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t('common.delete')}>
                  <ActionIcon size="sm" color="red" onClick={() => onDeleteSkill(skill)} aria-label={t('common.delete')}>
                    <IconTrash size={15} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          ))
        )}
      </Stack>

      <Group gap="xs" wrap="nowrap" align="flex-start">
        <TextInput
          size="sm"
          placeholder={t('skills.addPlaceholder')}
          value={newSkill}
          error={error}
          maxLength={255}
          onChange={(event) => {
            setNewSkill(event.currentTarget.value);
            setError(undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
          style={{ flex: 1 }}
        />
        <Button size="sm" variant="light" onClick={submit} loading={addSkill.isPending} disabled={!newSkill.trim()}>
          {t('common.add')}
        </Button>
      </Group>
    </Card>
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
