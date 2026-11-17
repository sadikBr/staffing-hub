import { Button, Group, Skeleton, Switch, Text } from '@mantine/core';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { ApiError } from '@/api/errors';
import { useEmployee, useEmployeeAssignments } from '@/api/hooks/employees';
import { QueryError } from '@/components/QueryError';
import { LogoMark } from '@/components/Logo';
import { SKILL_LEVELS, skillLevelRank } from '@/lib/enums';
import { fullName, initials } from '@/lib/format';
import NotFoundPage from '@/pages/NotFoundPage';
import classes from './ProfilePage.module.css';

/** "Mar 2025": month precision is what a profile needs. */
function month(date: string | null | undefined): string {
  return date ? dayjs(date).format('MMM YYYY') : '';
}

/**
 * A one-page consultant profile, ready to send to a customer: printed (or saved as PDF) by the browser. Options to
 * hide customer names and to include appreciations are not printed.
 */
export default function ProfilePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const employee = useEmployee(id);
  const assignments = useEmployeeAssignments(id);
  const [anonymous, setAnonymous] = useState(false);
  const [withAppreciations, setWithAppreciations] = useState(false);

  // Missions that happened or are happening; cancelled ones and mere prospects are left out.
  const missions = useMemo(
    () =>
      (assignments.data ?? []).filter(
        (assignment) => assignment.startDate && !['CANCELLED', 'PROSPECT'].includes(assignment.mission.status),
      ),
    [assignments.data],
  );
  // Customers are numbered in order of appearance when names are hidden.
  const customerAlias = useMemo(() => {
    const ids = [...new Set(missions.map((assignment) => assignment.mission.customer.id))];
    return new Map(ids.map((customerId, index) => [customerId, t('profile.customerAlias', { letter: String.fromCharCode(65 + (index % 26)) })]));
  }, [missions, t]);

  if (employee.isPending || assignments.isPending) return <Skeleton height={900} maw={820} mx="auto" radius="lg" />;
  if (employee.isError) {
    if (employee.error instanceof ApiError && employee.error.status === 404) return <NotFoundPage />;
    return <QueryError error={employee.error} onRetry={() => void employee.refetch()} />;
  }
  if (assignments.isError) return <QueryError error={assignments.error} onRetry={() => void assignments.refetch()} />;

  const data = employee.data;
  const groups = data.technologies
    .map((technology) => ({
      technology,
      skills: data.skills
        .filter((skill) => skill.skill.technologyId === technology.id)
        .sort((a, b) => skillLevelRank(b.level) - skillLevelRank(a.level)),
    }))
    .sort((a, b) => b.skills.length - a.skills.length);
  const customers = new Set(missions.map((assignment) => assignment.mission.customer.id)).size;

  return (
    <div className={classes.wrapper}>
      <div className={`${classes.toolbar} no-print`}>
        <Button component={Link} to={`/employees/${data.id}`} variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />}>
          {fullName(data)}
        </Button>
        <Group gap="lg">
          <Switch label={t('profile.hideCustomers')} checked={anonymous} onChange={(event) => setAnonymous(event.currentTarget.checked)} />
          <Switch
            label={t('profile.withAppreciations')}
            checked={withAppreciations}
            onChange={(event) => setWithAppreciations(event.currentTarget.checked)}
          />
          <Button leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>
            {t('profile.print')}
          </Button>
        </Group>
      </div>
      <Text size="xs" c="dimmed" ta="center" mb="md" className="no-print">
        {t('profile.printHint')}
      </Text>

      <article className={classes.page}>
        <header className={classes.header}>
          <div className={classes.monogram}>{initials(data)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className={classes.name}>{fullName(data)}</h1>
            <p className={classes.title}>
              {[t(`enums.seniority.${data.seniority}`), data.roles.map((role) => role.label).join(', ')].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className={classes.brand}>
            <LogoMark size={22} />
          </div>
        </header>

        <div className={classes.facts}>
          <div>
            <strong>{missions.length}</strong>
            <span>{t('profile.missions', { count: missions.length })}</span>
          </div>
          <div>
            <strong>{customers}</strong>
            <span>{t('profile.customers', { count: customers })}</span>
          </div>
          <div>
            <strong>{data.skills.length}</strong>
            <span>{t('profile.skills', { count: data.skills.length })}</span>
          </div>
          <div>
            <strong>{data.technologies.length}</strong>
            <span>{t('profile.technologies', { count: data.technologies.length })}</span>
          </div>
        </div>

        <div className={classes.columns}>
          <section>
            <h2 className={classes.heading}>{t('profile.expertise')}</h2>
            {groups.length === 0 && <p className={classes.muted}>{t('profile.noSkills')}</p>}
            {groups.map(({ technology, skills }) => (
              <div key={technology.id} className={classes.technology}>
                <h3>{technology.label}</h3>
                {skills.map((skill) => (
                  <div key={skill.skill.id} className={classes.skill}>
                    <span>{skill.skill.label}</span>
                    <span className={classes.dots} aria-label={t(`enums.skillLevel.${skill.level}`)}>
                      {SKILL_LEVELS.map((level, index) => (
                        <i key={level} data-on={index < skillLevelRank(skill.level) || undefined} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            <p className={classes.legend}>{t('profile.levelLegend')}</p>
          </section>

          <section>
            <h2 className={classes.heading}>{t('profile.experience')}</h2>
            {missions.length === 0 && <p className={classes.muted}>{t('profile.noMissions')}</p>}
            {missions.map((assignment) => (
              <div key={assignment.id} className={classes.mission}>
                <div className={classes.period}>
                  {month(assignment.startDate)} – {assignment.endDate ? month(assignment.endDate) : t('profile.now')}
                </div>
                <div className={classes.missionBody}>
                  <h3>{assignment.mission.label}</h3>
                  <p className={classes.customer}>
                    {anonymous ? customerAlias.get(assignment.mission.customer.id) : assignment.mission.customer.label}
                    {!anonymous && ` · ${assignment.mission.projectName}`}
                  </p>
                  {assignment.mission.description && <p>{assignment.mission.description}</p>}
                  {withAppreciations && assignment.appreciation && <blockquote>“{assignment.appreciation}”</blockquote>}
                </div>
              </div>
            ))}
          </section>
        </div>

        <footer className={classes.footer}>{t('profile.generated', { date: dayjs().format('D MMMM YYYY') })}</footer>
      </article>
    </div>
  );
}
