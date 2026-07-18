import { describe, it, expect } from 'vitest';
import { VENUES, LINKS, COUNTRY_NAMES, findVenue } from './venues.js';

describe('venues data', () => {
  it('has exactly 16 host-city venues', () => {
    expect(VENUES).toHaveLength(16);
  });

  it('has unique venue ids', () => {
    const ids = VENUES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('represents all three host countries', () => {
    const countries = new Set(VENUES.map((v) => v.country));
    expect(countries).toEqual(new Set(['us', 'mx', 'ca']));
  });

  it('gives every venue a display name and numeric layout coordinates', () => {
    for (const v of VENUES) {
      expect(typeof v.name).toBe('string');
      expect(v.name.length).toBeGreaterThan(0);
      expect(typeof v.x).toBe('number');
      expect(typeof v.y).toBe('number');
    }
  });

  it('has a display name for every country code used by venues', () => {
    const usedCountries = new Set(VENUES.map((v) => v.country));
    for (const code of usedCountries) {
      expect(COUNTRY_NAMES[code]).toBeTruthy();
    }
  });

  it('has no dangling links — every LINKS endpoint resolves to a real venue', () => {
    for (const [a, b] of LINKS) {
      expect(findVenue(a), `link endpoint "${a}" should exist`).toBeTruthy();
      expect(findVenue(b), `link endpoint "${b}" should exist`).toBeTruthy();
    }
  });

  it('has no self-referencing links', () => {
    for (const [a, b] of LINKS) {
      expect(a).not.toBe(b);
    }
  });

  it('findVenue returns undefined for an unknown id', () => {
    expect(findVenue('ZZZ')).toBeUndefined();
  });

  it('findVenue returns the matching venue for a known id', () => {
    const v = findVenue('YVR');
    expect(v).toBeDefined();
    expect(v.name).toBe('Vancouver');
    expect(v.country).toBe('ca');
  });
});
