// src/lib/density.js
//
// Single source of truth for the high/med/low density classification used
// by both CrowdMesh (crowd %) and Workforce (demand %). Previously this
// threshold logic existed as a named function in one component and was
// silently re-typed as a raw duplicate ternary in the other — a classic
// "two copies that can drift apart" bug waiting to happen.

export const DENSITY_THRESHOLDS = { high: 75, medium: 45 };

/**
 * @param {number} level - a 0-100 percentage
 * @returns {'high' | 'med' | 'low'}
 */
export function densityTier(level) {
  if (level >= DENSITY_THRESHOLDS.high) return 'high';
  if (level >= DENSITY_THRESHOLDS.medium) return 'med';
  return 'low';
}
