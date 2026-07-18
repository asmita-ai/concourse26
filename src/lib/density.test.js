import { describe, it, expect } from 'vitest';
import { densityTier, DENSITY_THRESHOLDS } from './density.js';

describe('densityTier', () => {
  it('classifies values at or above the high threshold as high', () => {
    expect(densityTier(DENSITY_THRESHOLDS.high)).toBe('high');
    expect(densityTier(100)).toBe('high');
  });

  it('classifies values at or above the medium threshold (but below high) as med', () => {
    expect(densityTier(DENSITY_THRESHOLDS.medium)).toBe('med');
    expect(densityTier(74)).toBe('med');
  });

  it('classifies values below the medium threshold as low', () => {
    expect(densityTier(0)).toBe('low');
    expect(densityTier(DENSITY_THRESHOLDS.medium - 1)).toBe('low');
  });
});
