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

const FALLBACK_COLORS = ['brand', 'teal', 'grape', 'orange', 'cyan', 'pink', 'indigo', 'lime'];

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
  return (
    <Avatar
      size={size}
      radius="xl"
      color={colorFor(person)}
      variant={solid ? 'filled' : 'light'}
      alt={fullName(person)}
      style={solid ? { border: '2px solid var(--app-surface)' } : undefined}
    >
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
