import { Text, Tooltip } from '@mantine/core';
import { IconArrowRight, IconBeach } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { EmployeeAvailability } from '@/api/types';
import { EmployeeAvatar } from '@/components/EmployeeAvatar';
import { formatPercent, fullName } from '@/lib/format';
import classes from './CapacityBoard.module.css';

type Bucket = 'free' | 'mostly' | 'partly' | 'full' | 'over';

const BUCKETS: { key: Bucket; color: string; filter: string }[] = [
  { key: 'free', color: 'var(--sh-free)', filter: '&minAvailability=100' },
  { key: 'mostly', color: 'var(--mantine-color-cyan-6)', filter: '&minAvailability=50' },
  { key: 'partly', color: 'var(--sh-partial)', filter: '&minAvailability=25' },
  { key: 'full', color: 'var(--sh-primary)', filter: '' },
  { key: 'over', color: 'var(--sh-over)', filter: '' },
];

/** People shown per column; the rest are one click away on the availability page. */
const SHOWN = 6;

function bucketOf(person: EmployeeAvailability): Bucket {
  if (person.overbooked) return 'over';
  if (person.availability >= 100) return 'free';
  if (person.availability >= 50) return 'mostly';
  if (person.availability > 0) return 'partly';
  return 'full';
}

interface CapacityBoardProps {
  people: EmployeeAvailability[];
  /** Everyone, when `people` is only the first page. */
  total: number;
  /** `from=...&to=...` of the period, for links to the availability page. */
  period: string;
}

/**
 * The team sorted into five columns, from fully free to overbooked: a proportional bar on top, then who is in each
 * column, each with a ring showing how booked they are. Works the same for 5 people or 500.
 */
export function CapacityBoard({ people, total, period }: CapacityBoardProps) {
  const { t } = useTranslation();
  const columns = BUCKETS.map((bucket) => ({
    ...bucket,
    people: people
      .filter((person) => bucketOf(person) === bucket.key)
      // Most available first; among the overbooked, the most overbooked first.
      .sort((a, b) =>
        bucket.key === 'over' ? b.peakOccupation - a.peakOccupation : b.availability - a.availability || a.lastName.localeCompare(b.lastName),
      ),
  }));

  return (
    <div>
      <div className={classes.bar} aria-hidden="true">
        {columns
          .filter((column) => column.people.length > 0)
          .map((column) => (
            <span key={column.key} style={{ flexGrow: column.people.length, background: column.color }} />
          ))}
      </div>

      <div className={classes.board}>
        {columns.map((column) => (
          <section key={column.key} className={classes.column} style={{ '--c': column.color } as React.CSSProperties}>
            <header className={classes.head}>
              <span className={`${classes.count} tabular-nums`}>{column.people.length}</span>
              <span className={classes.label}>{t(`dashboard.capacity.buckets.${column.key}`)}</span>
            </header>

            {column.people.length === 0 ? (
              <Text size="xs" c="dimmed" className={classes.nobody}>
                {t('dashboard.capacity.nobody')}
              </Text>
            ) : (
              <ul className={classes.people}>
                {column.people.slice(0, SHOWN).map((person) => (
                  <li key={person.id}>
                    <Tooltip
                      label={[
                        t('availability.meterTooltip', {
                          occupation: formatPercent(person.peakOccupation),
                          availability: formatPercent(person.availability),
                        }),
                        person.absentDays > 0 ? t('absences.daysOff', { count: person.absentDays }) : undefined,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      openDelay={400}
                    >
                      <Link to={`/employees/${person.id}`} className={classes.person}>
                        <LoadRing load={person.peakOccupation}>
                          <EmployeeAvatar person={person} size={26} />
                        </LoadRing>
                        <span className={classes.name}>{fullName(person)}</span>
                        {person.absentDays > 0 && <IconBeach size={13} className={classes.away} aria-label={t('absences.daysOff', { count: person.absentDays })} />}
                        <span className={`${classes.load} tabular-nums`}>
                          {/* Free columns show how free, booked columns how booked: the column says which. */}
                          {formatPercent(Math.round(column.key === 'full' || column.key === 'over' ? person.peakOccupation : person.availability))}
                        </span>
                      </Link>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            )}

            {column.people.length > SHOWN && (
              <Link to={`/availability?${period}${column.filter}`} className={classes.more}>
                {t('dashboard.capacity.more', { count: column.people.length - SHOWN })}
                <IconArrowRight size={13} />
              </Link>
            )}
          </section>
        ))}
      </div>

      {total > people.length && (
        <Text size="xs" c="dimmed" mt="sm">
          {t('dashboard.capacity.partial', { shown: people.length, total })}
        </Text>
      )}
    </div>
  );
}

/** A ring around the avatar, filled up to the person's load (a full ring at 100% and above). */
function LoadRing({ load, children }: { load: number; children: React.ReactNode }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(load, 100) / 100) * circumference;
  return (
    <span className={classes.ring}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r={radius} className={classes.ringTrack} />
        {load > 0 && <circle cx="18" cy="18" r={radius} className={classes.ringFill} strokeDasharray={`${filled} ${circumference}`} />}
      </svg>
      {children}
    </span>
  );
}
