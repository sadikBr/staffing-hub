import { Group, Progress, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { availabilityColor } from '@/lib/availability';
import { formatPercent } from '@/lib/format';

interface AvailabilityMeterProps {
  /** Peak occupation in percent (can exceed 100). */
  occupation: number;
  availability: number;
  compact?: boolean;
}

/** Shows how much of the employee is booked, and what is left. */
export function AvailabilityMeter({ occupation, availability, compact = false }: AvailabilityMeterProps) {
  const { t } = useTranslation();
  const color = availabilityColor(availability);
  const booked = Math.min(occupation, 100);

  return (
    <Tooltip label={t('availability.meterTooltip', { occupation: formatPercent(occupation), availability: formatPercent(availability) })}>
      <Stack gap={4} miw={compact ? 120 : 160}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Text size="xs" fw={600} c={color} className="tabular-nums">
            {t('availability.free', { value: formatPercent(availability) })}
          </Text>
          {!compact && (
            <Text size="xs" c="dimmed" className="tabular-nums">
              {t('availability.booked', { value: formatPercent(occupation) })}
            </Text>
          )}
        </Group>
        <Progress.Root size={compact ? 6 : 8} radius="xl">
          <Progress.Section value={booked} color={occupation > 100 ? 'red' : 'brand'} />
          <Progress.Section value={100 - booked} color={color} style={{ opacity: 0.35 }} />
        </Progress.Root>
      </Stack>
    </Tooltip>
  );
}
