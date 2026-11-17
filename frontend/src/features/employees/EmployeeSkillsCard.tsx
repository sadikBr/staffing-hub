import { ActionIcon, Alert, Button, Group, Modal, MultiSelect, SegmentedControl, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconCode, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { employeeApi } from '@/api/hooks/employees';
import { useTechnologies } from '@/api/hooks/reference';
import type { Employee, SkillLevel } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { EmptyState } from '@/components/EmptyState';
import { LevelPicker } from '@/components/LevelPicker';
import { Section } from '@/components/Section';
import { SkillSelect } from '@/components/SkillSelect';
import { SKILL_LEVELS, skillLevelRank } from '@/lib/enums';
import classes from './EmployeeSkillsCard.module.css';

/** The employee's technologies, and their level in each skill of those technologies. */
export function EmployeeSkillsCard({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  const [technologiesOpened, technologiesModal] = useDisclosure();
  const [addOpened, addModal] = useDisclosure();
  const { canEdit } = usePermissions();

  const setLevel = useApiMutation({ mutationFn: employeeApi.setSkillLevel, successMessage: t('employees.skills.levelUpdated') });
  const removeSkill = useApiMutation({ mutationFn: employeeApi.removeSkill, successMessage: t('employees.skills.removed') });

  const groups = employee.technologies.map((technology) => ({
    technology,
    skills: employee.skills
      .filter((skill) => skill.skill.technologyId === technology.id)
      .sort((a, b) => skillLevelRank(b.level) - skillLevelRank(a.level) || a.skill.label.localeCompare(b.skill.label)),
  }));

  return (
    <Section
      title={t('employees.skills.title')}
      description={t('employees.skills.description')}
      icon={<IconCode size={17} stroke={1.8} />}
      sheet="padded"
      actions={
        canEdit && (
        <>
          <Button size="xs" variant="default" leftSection={<IconPencil size={14} />} onClick={technologiesModal.open}>
            {t('employees.skills.editTechnologies')}
          </Button>
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addModal.open} disabled={employee.technologies.length === 0}>
            {t('employees.skills.add')}
          </Button>
        </>
        )
      }
    >
      {groups.length === 0 ? (
        <EmptyState
          compact
          icon={<IconCode size={22} stroke={1.5} />}
          title={t('employees.skills.emptyTitle')}
          description={t('employees.skills.emptyDescription')}
          action={
            canEdit && (
              <Button size="xs" variant="light" onClick={technologiesModal.open}>
                {t('employees.skills.editTechnologies')}
              </Button>
            )
          }
        />
      ) : (
        <div className={classes.groups}>
          {groups.map(({ technology, skills }) => (
            <div key={technology.id} className={classes.group}>
              <div className={classes.groupHead}>
                <div className={classes.groupName}>
                  <span className={classes.groupDot} />
                  <Text fw={650}>{technology.label}</Text>
                </div>
                <Text size="xs" c="dimmed">
                  {t('technologies.skillCount', { count: skills.length })}
                </Text>
              </div>
              {skills.length === 0 ? (
                <Text size="sm" c="dimmed" py="xs">
                  {t('employees.skills.noSkillInTechnology')}
                </Text>
              ) : (
                skills.map((skill) => (
                  <div key={skill.skill.id} className={classes.skill}>
                    <Text size="sm" fw={550} truncate style={{ flex: 1, minWidth: 0 }}>
                      {skill.skill.label}
                    </Text>
                    <LevelPicker
                      disabled={!canEdit}
                      value={skill.level}
                      onChange={(level) => setLevel.mutate({ id: employee.id, skillId: skill.skill.id, level })}
                    />
                    {canEdit && (
                    <Tooltip label={t('common.remove')}>
                      <ActionIcon
                        size="sm"
                        className={classes.remove}
                        aria-label={t('common.remove')}
                        onClick={() => removeSkill.mutate({ id: employee.id, skillId: skill.skill.id })}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Tooltip>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      <TechnologiesModal employee={employee} opened={technologiesOpened} onClose={technologiesModal.close} />
      <AddSkillModal employee={employee} opened={addOpened} onClose={addModal.close} />
    </Section>
  );
}

function TechnologiesModal({ employee, opened, onClose }: { employee: Employee; opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const technologies = useTechnologies();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (opened) setSelected(employee.technologies.map((technology) => technology.id));
  }, [opened, employee.technologies]);

  const lostSkills = employee.skills.filter((skill) => !selected.includes(skill.skill.technologyId));
  const save = useApiMutation({
    mutationFn: employeeApi.setTechnologies,
    successMessage: t('employees.skills.technologiesUpdated'),
    onSuccess: onClose,
  });

  return (
    <Modal opened={opened} onClose={onClose} title={t('employees.skills.technologiesTitle')}>
      <Stack>
        <MultiSelect
          label={t('employees.columns.technologies')}
          placeholder={t('employees.skills.technologiesPlaceholder')}
          data={(technologies.data ?? []).map((technology) => ({ value: technology.id, label: technology.label }))}
          value={selected}
          onChange={setSelected}
          searchable
          clearable
          data-autofocus
        />
        {lostSkills.length > 0 && (
          <Alert color="orange" variant="light" icon={<IconAlertTriangle size={18} />}>
            {t('employees.skills.lostSkillsWarning', {
              count: lostSkills.length,
              skills: lostSkills.map((skill) => skill.skill.label).join(', '),
            })}
          </Alert>
        )}
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button loading={save.isPending} onClick={() => save.mutate({ id: employee.id, technologyIds: selected })}>
            {t('common.save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function AddSkillModal({ employee, opened, onClose }: { employee: Employee; opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const [skillId, setSkillId] = useState<string | null>(null);
  const [level, setLevel] = useState<SkillLevel>('INTERMEDIATE');

  useEffect(() => {
    if (opened) {
      setSkillId(null);
      setLevel('INTERMEDIATE');
    }
  }, [opened]);

  const technologyIds = useMemo(() => employee.technologies.map((technology) => technology.id), [employee.technologies]);
  const existing = useMemo(() => employee.skills.map((skill) => skill.skill.id), [employee.skills]);

  const save = useApiMutation({ mutationFn: employeeApi.setSkillLevel, successMessage: t('employees.skills.added'), onSuccess: onClose });

  return (
    <Modal opened={opened} onClose={onClose} title={t('employees.skills.addTitle')}>
      <Stack>
        <SkillSelect
          label={t('employees.fields.skill')}
          description={t('employees.skills.addHelp')}
          technologyIds={technologyIds}
          excludeIds={existing}
          value={skillId}
          onChange={setSkillId}
          data-autofocus
        />
        <div>
          <Text size="sm" fw={500} mb={6}>
            {t('employees.skills.level')}
          </Text>
          <SegmentedControl
            fullWidth
            size="xs"
            value={level}
            onChange={(value) => setLevel(value as SkillLevel)}
            data={SKILL_LEVELS.map((value) => ({ value, label: t(`enums.skillLevel.${value}`) }))}
          />
        </div>
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!skillId}
            loading={save.isPending}
            onClick={() => skillId && save.mutate({ id: employee.id, skillId, level })}
          >
            {t('employees.skills.add')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
