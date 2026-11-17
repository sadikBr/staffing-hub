import { ActionIcon, Button, Group, Modal, Select, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTargetArrow, IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { missionApi } from '@/api/hooks/missions';
import { useTechnologies } from '@/api/hooks/reference';
import type { Mission, SkillLevel } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { EmptyState } from '@/components/EmptyState';
import { SectionCard } from '@/components/SectionCard';
import { SkillSelect } from '@/components/SkillSelect';
import { SKILL_LEVELS } from '@/lib/enums';

const ANY = 'ANY';

/** The skills the mission needs, each with an optional minimum level. */
export function RequiredSkillsCard({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const technologies = useTechnologies();
  const [opened, { open, close }] = useDisclosure();

  const setSkill = useApiMutation({ mutationFn: missionApi.setSkill, successMessage: t('missions.requiredSkills.updated') });
  const removeSkill = useApiMutation({ mutationFn: missionApi.removeSkill, successMessage: t('missions.requiredSkills.removed') });

  const technologyById = useMemo(
    () => new Map((technologies.data ?? []).map((technology) => [technology.id, technology.label])),
    [technologies.data],
  );
  const levelOptions = [
    { value: ANY, label: t('common.anyLevel') },
    ...SKILL_LEVELS.map((value) => ({ value, label: t('missions.requiredSkills.atLeast', { level: t(`enums.skillLevel.${value}`) }) })),
  ];

  return (
    <SectionCard
      title={t('missions.requiredSkills.title')}
      description={t('missions.requiredSkills.description')}
      actions={
        <Button size="xs" variant="default" leftSection={<IconPlus size={14} />} onClick={open}>
          {t('common.add')}
        </Button>
      }
    >
      {mission.requiredSkills.length === 0 ? (
        <EmptyState compact icon={<IconTargetArrow size={22} />} title={t('missions.requiredSkills.emptyTitle')} description={t('missions.requiredSkills.emptyDescription')} />
      ) : (
        <Stack gap="xs">
          {mission.requiredSkills.map((required) => (
            <Group key={required.skill.id} justify="space-between" wrap="nowrap" gap="sm">
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={500} truncate>
                  {required.skill.label}
                </Text>
                <Text size="xs" c="dimmed">
                  {technologyById.get(required.skill.technologyId)}
                </Text>
              </div>
              <Group gap={4} wrap="nowrap">
                <Select
                  size="xs"
                  w={170}
                  data={levelOptions}
                  value={required.requiredLevel ?? ANY}
                  allowDeselect={false}
                  aria-label={t('missions.requiredSkills.level')}
                  onChange={(value) =>
                    setSkill.mutate({
                      id: mission.id,
                      skillId: required.skill.id,
                      requiredLevel: value === ANY || !value ? null : (value as SkillLevel),
                    })
                  }
                />
                <Tooltip label={t('common.remove')}>
                  <ActionIcon color="red" aria-label={t('common.remove')} onClick={() => removeSkill.mutate({ id: mission.id, skillId: required.skill.id })}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          ))}
        </Stack>
      )}
      <AddRequiredSkillModal mission={mission} opened={opened} onClose={close} levelOptions={levelOptions} />
    </SectionCard>
  );
}

function AddRequiredSkillModal({
  mission,
  opened,
  onClose,
  levelOptions,
}: {
  mission: Mission;
  opened: boolean;
  onClose: () => void;
  levelOptions: { value: string; label: string }[];
}) {
  const { t } = useTranslation();
  const [skillId, setSkillId] = useState<string | null>(null);
  const [level, setLevel] = useState<string>(ANY);

  useEffect(() => {
    if (opened) {
      setSkillId(null);
      setLevel(ANY);
    }
  }, [opened]);

  const existing = useMemo(() => mission.requiredSkills.map((skill) => skill.skill.id), [mission.requiredSkills]);
  const save = useApiMutation({ mutationFn: missionApi.setSkill, successMessage: t('missions.requiredSkills.added'), onSuccess: onClose });

  return (
    <Modal opened={opened} onClose={onClose} title={t('missions.requiredSkills.addTitle')}>
      <Stack>
        <SkillSelect label={t('employees.fields.skill')} excludeIds={existing} value={skillId} onChange={setSkillId} data-autofocus />
        <Select
          label={t('missions.requiredSkills.level')}
          description={t('missions.requiredSkills.levelHelp')}
          data={levelOptions}
          value={level}
          onChange={(value) => setLevel(value ?? ANY)}
          allowDeselect={false}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            disabled={!skillId}
            loading={save.isPending}
            onClick={() => skillId && save.mutate({ id: mission.id, skillId, requiredLevel: level === ANY ? null : (level as SkillLevel) })}
          >
            {t('common.add')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
