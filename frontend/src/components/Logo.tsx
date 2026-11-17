import { Group, Text } from '@mantine/core';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f77f2" />
          <stop offset="1" stopColor="#3740be" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <circle cx="12" cy="12" r="4" fill="#fff" />
      <circle cx="21" cy="13" r="3" fill="#fff" opacity=".75" />
      <path d="M5 25c1-4.5 4-7 7-7s6 2.5 7 7z" fill="#fff" />
      <path d="M17 24.5c.7-3 2.3-5 4-5s3.6 1.6 4.6 5z" fill="#fff" opacity=".75" />
    </svg>
  );
}

export function Logo({ size = 32, withText = false }: { size?: number; withText?: boolean }) {
  if (!withText) return <LogoMark size={size} />;
  return (
    <Group gap={10} wrap="nowrap">
      <LogoMark size={size} />
      <Text fw={700} size="lg" style={{ letterSpacing: '-0.01em', whiteSpace: 'nowrap' }} visibleFrom="xs">
        Staffing Hub
      </Text>
    </Group>
  );
}
