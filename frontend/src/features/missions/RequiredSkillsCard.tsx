import { ActionIcon, Button, Group, Modal, ScrollArea, Select, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconMinus, IconPlus, IconTargetArrow, IconX } from '@tabler/icons-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { missionApi } from '@/api/hooks/missions';
import { useTechnologies } from '@/api/hooks/reference';
import type { Mission, MissionAssignment, RequiredSkillMatch, SkillLevel } from '@/api/types';
import { useApiMutation } from '@/api/useApiMutation';
import { usePermissions } from '@/auth/permissions';
import { EmployeeAvatar } from '@/components/EmployeeAvatar';
import { EmptyState } from '@/components/EmptyState';
import { Section } from '@/components/Section';
import { SkillSelect } from '@/components/SkillSelect';
import { SKILL_LEVELS } from '@/lib/enums';
import { fullName } from '@/lib/format';
import classes from './RequiredSkillsCard.module.css';

const ANY = 'ANY';

type MatchState = 'met' | 'below' | 'missing';

/** The skills the mission needs, each with an optional minimum level, and how the team covers each one. */
export function RequiredSkillsCard({ mission }: { mission: Mission }) {
  const { t } = useTranslation();
  const technologies = useTechnologies();
  const [opened, { open, close }] = useDisclosure();
  const { canEdit } = usePermissions();

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

  // Each team member once, with their best match for every required skill.
  const team = useMemo(() => {
    const byEmployee = new Map<string, { person: MissionAssignment['employee']; matches: Map<string, RequiredSkillMatch> }>();
    for (const assignment of mission.assignments) {
      const entry = byEmployee.get(assignment.employee.id) ?? { person: assignment.employee, matches: new Map() };
      for (const match of assignment.skillMatches) {
        const known = entry.matches.get(match.skill.id);
        if (!known || (match.meetsRequirement && !known.meetsRequirement)) entry.matches.set(match.skill.id, match);
      }
      byEmployee.set(assignment.employee.id, entry);
    }
    return [...byEmployee.values()];
  }, [mission.assignments]);

  const columns = `minmax(150px, 1fr) 190px ${team.length ? `repeat(${team.length}, 36px) 64px` : ''} 32px`;

  return (
    <Section
      title={t('missions.requiredSkills.title')}
      description={t('missions.requiredSkills.description')}
      icon={<IconTargetArrow size={17} stroke={1.8} />}
      sheet="padded"
      actions={
        canEdit && (
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={open}>
            {t('common.add')}
          </Button>
        )
      }
    >
      {mission.requiredSkills.length === 0 ? (
        <EmptyState
          compact
          icon={<IconTargetArrow size={22} stroke={1.5} />}
          title={t('missions.requiredSkills.emptyTitle')}
          description={t('missions.requiredSkills.emptyDescription')}
        />
      ) : (
        <ScrollArea type="auto" offsetScrollbars>
          <div className={classes.matrix} style={{ gridTemplateColumns: columns, minWidth: 420 + team.length * 44 }}>
            <div className={`${classes.cell} ${classes.head} sh-label`}>{t('employees.fields.skill')}</div>
            <div className={`${classes.cell} ${classes.head} sh-label`}>{t('missions.requiredSkills.level')}</div>
            {team.map(({ person }) => (
              <div key={person.id} className={`${classes.cell} ${classes.head} ${classes.center}`}>
                <Tooltip label={fullName(person)}>
                  <Link to={`/employees/${person.id}`}>
                    <EmployeeAvatar person={person} size={28} />
                  </Link>
                </Tooltip>
              </div>
            ))}
            {team.length > 0 && <div className={`${classes.cell} ${classes.head} sh-label`} style={{ textAlign: 'right' }}>{t('missions.requiredSkills.covered')}</div>}
            <div className={`${classes.cell} ${classes.head}`} />

            {mission.requiredSkills.map((required) => {
              const states = team.map(({ matches }) => matchState(matches.get(required.skill.id)));
              const met = states.filter((state) => state === 'met').length;
              return (
                <Fragment key={required.skill.id}>
                  <div className={classes.cell}>
                    <Text size="sm" fw={600} truncate>
                      {required.skill.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {technologyById.get(required.skill.technologyId)}
                    </Text>
                  </div>
                  <div className={classes.cell}>
                    <Select
                      size="xs"
                      variant="filled"
                      disabled={!canEdit}
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
                  </div>
                  {team.map(({ person, matches }, index) => (
                    <div key={person.id} className={`${classes.cell} ${classes.center}`}>
                      <MatchMark state={states[index]} name={fullName(person)} match={matches.get(required.skill.id)} />
                    </div>
                  ))}
                  {team.length > 0 && (
                    <div className={classes.cell} style={{ textAlign: 'right' }}>
                      <Text size="sm" fw={600} className="tabular-nums" c={met === 0 ? 'var(--sh-over)' : undefined}>
                        {met}/{team.length}
                      </Text>
                    </div>
                  )}
                  <div className={`${classes.cell} ${classes.center}`}>
                    {canEdit && (
                    <Tooltip label={t('common.remove')}>
                      <ActionIcon size="sm" aria-label={t('common.remove')} onClick={() => removeSkill.mutate({ id: mission.id, skillId: required.skill.id })}>
                        <IconX size={14} />
                      </ActionIcon>
                    </Tooltip>
                    )}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </ScrollArea>
      )}
      <AddRequiredSkillModal mission={mission} opened={opened} onClose={close} levelOptions={levelOptions} />
    </Section>
  );
}

function matchState(match: RequiredSkillMatch | undefined): MatchState {
  if (match?.meetsRequirement) return 'met';
  return match?.employeeLevel ? 'below' : 'missing';
}

function MatchMark({ state, name, match }: { state: MatchState; name: string; match?: RequiredSkillMatch }) {
  const { t } = useTranslation();
  const has = match?.employeeLevel ? t('missions.skillMatch.has', { level: t(`enums.skillLevel.${match.employeeLevel}`) }) : t('missions.skillMatch.missing');
  return (
    <Tooltip label={`${name}: ${has}`}>
      <span className={classes.mark} data-state={state} aria-label={`${name}: ${has}`}>
        {state === 'met' ? <IconCheck size={12} stroke={3} /> : state === 'below' ? <IconMinus size={12} stroke={3} /> : null}
      </span>
    </Tooltip>
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
