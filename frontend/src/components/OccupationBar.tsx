import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { availabilityTone } from '@/lib/availability';
import { formatPercent } from '@/lib/format';
import classes from './OccupationBar.module.css';

interface AvailabilityMeterProps {
  /** Peak occupation in percent (can exceed 100). */
  occupation: number;
  availability: number;
  compact?: boolean;
}

/** How much of the person is booked (ink) and what is left (hatched green). Red when overbooked. */
export function AvailabilityMeter({ occupation, availability, compact = false }: AvailabilityMeterProps) {
  const { t } = useTranslation();
  const booked = Math.min(occupation, 100);

  return (
    <Tooltip label={t('availability.meterTooltip', { occupation: formatPercent(occupation), availability: formatPercent(availability) })}>
      <Stack gap={6} miw={compact ? 110 : 150}>
        <Group justify="space-between" gap="xs" wrap="nowrap" align="baseline">
          <Text component="span" className={`${classes.value} tabular-nums`} c={availabilityTone(availability)}>
            {t('availability.free', { value: formatPercent(availability) })}
          </Text>
          {!compact && (
            <Text size="xs" c="dimmed" className="tabular-nums">
              {t('availability.booked', { value: formatPercent(occupation) })}
            </Text>
          )}
        </Group>
        <div className={classes.track}>
          <div className={classes.booked} style={{ width: `${booked}%` }} data-over={occupation > 100 || undefined} />
        </div>
      </Stack>
    </Tooltip>
  );
}
