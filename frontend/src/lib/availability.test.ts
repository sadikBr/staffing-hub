import { describe, expect, it } from 'vitest';
import { availabilityColor } from './availability';

describe('availabilityColor', () => {
  it('is green when mostly free, orange when partly booked, red when full', () => {
    expect(availabilityColor(100)).toBe('teal');
    expect(availabilityColor(50)).toBe('teal');
    expect(availabilityColor(20)).toBe('orange');
    expect(availabilityColor(0)).toBe('red');
  });
});
