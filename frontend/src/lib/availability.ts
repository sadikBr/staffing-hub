/** Green when mostly free, orange when partly booked, red when full or overbooked. */
export function availabilityColor(availability: number): string {
  if (availability >= 50) return 'teal';
  if (availability > 0) return 'orange';
  return 'red';
}
