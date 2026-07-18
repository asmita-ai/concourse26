import { describe, it, expect } from 'vitest';
import { VENUES, LINKS, COUNTRY_NAMES, findVenue } from './venues.js';

describe('venues data integrity', () => {
  it('contains exactly 16 host venues', () => {
    expect(VENUES).toHaveLength(16);
  });

  it('gives every venue a unique id', () => {
    const ids = VENUES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('assigns every venue a country present in COUNTRY_NAMES', () => {
    for (const v of VENUES) {
      expect(COUNTRY_NAMES[v.country]).toBeDefined();
    }
  });

  it('splits venues across all three host countries', () => {
    const countries = new Set(VENUES.map((v) => v.country));
    expect(countries).toEqual(new Set(['us', 'mx', 'ca']));
  });

  it('references only real venue ids in LINKS (no dangling edges)', () => {
    const ids = new Set(VENUES.map((v) => v.id));
    for (const [a, b] of LINKS) {
      expect(ids.has(a)).toBe(true);
      expect(ids.has(b)).toBe(true);
    }
  });

  it('findVenue resolves a known id and returns undefined for an unknown one', () => {
    expect(findVenue('NYNJ')?.name).toBe('New York/New Jersey');
    expect(findVenue('NOT-REAL')).toBeUndefined();
  });
});
