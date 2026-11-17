import { Group, Text } from '@mantine/core';
import { useId } from 'react';

/** A tiny staffing board: bars on a timeline, on the brand gradient. */
export function LogoMark({ size = 30 }: { size?: number }) {
  const gradient = `logo-${useId()}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0, display: 'block' }}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b5bf6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradient})`} />
      <rect x="6" y="8" width="14" height="4" rx="2" fill="#fff" />
      <rect x="12" y="14" width="14" height="4" rx="2" fill="#fff" opacity=".75" />
      <rect x="6" y="20" width="9" height="4" rx="2" fill="#fff" opacity=".45" />
    </svg>
  );
}

export function Logo({ size = 30, withText = false }: { size?: number; withText?: boolean }) {
  if (!withText) return <LogoMark size={size} />;
  return (
    <Group gap={10} wrap="nowrap">
      <LogoMark size={size} />
      <Text
        component="span"
        className="sh-serif"
        fz={21}
        fw={500}
        lh={1}
        style={{ whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}
        visibleFrom="xs"
      >
        Staffing <em style={{ fontWeight: 400 }}>Hub</em>
      </Text>
    </Group>
  );
}
