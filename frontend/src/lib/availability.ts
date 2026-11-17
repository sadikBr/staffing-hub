/** Green when mostly free, orange when partly booked, red when full or overbooked. */
export function availabilityColor(availability: number): string {
  if (availability >= 50) return 'teal';
  if (availability > 0) return 'orange';
  return 'red';
}

const TONES: Record<string, string> = { teal: 'var(--sh-free)', orange: 'var(--sh-partial)', red: 'var(--sh-over)' };

/** The same scale as {@link availabilityColor}, as a CSS color from the design tokens. */
export function availabilityTone(availability: number): string {
  return TONES[availabilityColor(availability)];
}

