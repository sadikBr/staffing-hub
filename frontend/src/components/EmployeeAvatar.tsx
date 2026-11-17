import { Avatar, Box, Group, Text, type MantineSize } from '@mantine/core';
import { Link } from 'react-router';
import type { Community } from '@/api/types';
import { COMMUNITY_COLORS } from '@/lib/enums';
import { fullName, initials } from '@/lib/format';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  community?: Community;
}

const FALLBACK_COLORS = ['indigo', 'teal', 'grape', 'orange', 'cyan', 'pink', 'indigo', 'lime'];

/** A stable color per person: their community's color, or one derived from their id. */
function colorFor(person: Person): string {
  if (person.community) return COMMUNITY_COLORS[person.community];
  let hash = 0;
  for (const char of person.id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

interface EmployeeAvatarProps {
  person: Person;
  size?: MantineSize | number;
  /** Solid colors with a ring: for overlapping avatars (Avatar.Group). */
  solid?: boolean;
}

export function EmployeeAvatar({ person, size = 'md', solid = false }: EmployeeAvatarProps) {
  const color = `var(--mantine-color-${colorFor(person)}-6)`;
  const style = solid
    ? { '--avatar-bg': color, '--avatar-color': '#fff', border: '2px solid var(--sh-surface)' }
    : {
        '--avatar-bg': `color-mix(in srgb, ${color} 18%, var(--sh-surface))`,
        '--avatar-color': `color-mix(in srgb, ${color} 85%, var(--sh-text))`,
      };
  return (
    <Avatar size={size} radius="xl" alt={fullName(person)} style={style as React.CSSProperties}>
      {initials(person)}
    </Avatar>
  );
}

interface PersonCellProps {
  person: Person;
  secondary?: React.ReactNode;
  /** Link to the person's page (default true). */
  link?: boolean;
  size?: MantineSize;
}

/** Avatar + name (+ a secondary line), linking to the employee's page. */
export function PersonCell({ person, secondary, link = true, size = 'md' }: PersonCellProps) {
  const content = (
    <Group gap="sm" wrap="nowrap">
      <EmployeeAvatar person={person} size={size} />
      <Box style={{ minWidth: 0 }}>
        <Text size="sm" fw={600} truncate>
          {fullName(person)}
        </Text>
        {secondary && (
          <Text size="xs" c="dimmed" truncate component="div">
            {secondary}
          </Text>
        )}
      </Box>
    </Group>
  );
  if (!link) return content;
  return (
    <Link to={`/employees/${person.id}`} onClick={(event) => event.stopPropagation()}>
      {content}
    </Link>
  );
}

/** A large square monogram for a person's page header. */
export function Monogram({ person, size = 84 }: { person: Person; size?: number }) {
  const color = `var(--mantine-color-${colorFor(person)}-6)`;
  return (
    <Box
      aria-hidden="true"
      w={size}
      h={size}
      style={{
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 22,
        background: `linear-gradient(145deg, color-mix(in srgb, ${color} 85%, #fff), ${color})`,
        boxShadow: `0 12px 28px -12px color-mix(in srgb, ${color} 70%, transparent)`,
        color: '#fff',
        fontFamily: 'var(--sh-font-serif)',
        fontVariationSettings: "'opsz' 72",
        fontSize: size * 0.42,
        fontWeight: 400,
        letterSpacing: '-0.04em',
        lineHeight: 1,
      }}
    >
      {initials(person)}
    </Box>
  );
}
