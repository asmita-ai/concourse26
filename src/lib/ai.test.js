import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askAI } from './ai.js';

describe('askAI', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('falls back to demo mode when the server API is unavailable', async () => {
    const { text, source } = await askAI('journey', 'Origin: Chicago. Itinerary: Dallas then Atlanta.');
    expect(source).toBe('demo');
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
  });

  it('produces incident triage with severity and a cross-venue pattern field', async () => {
    const { text } = await askAI('incident', 'Venue: Atlanta. Report: Fan collapsed near Gate C, needs medical attention');
    expect(text).toMatch(/SEVERITY:/);
    expect(text).toMatch(/CROSS-VENUE PATTERN:/);
    expect(text).toMatch(/Medical/);
  });

  it('flags security incidents as critical severity', async () => {
    const { text } = await askAI('incident', 'Venue: Houston. Report: Unauthorized person with a weapon near Gate A');
    expect(text).toMatch(/SEVERITY: Critical/);
  });

  it('identifies the highest-density venue and checks for cascading risk', async () => {
    const venues = [
      { id: 'DAL', name: 'Dallas', level: 30 },
      { id: 'ATL', name: 'Atlanta', level: 92 },
      { id: 'MIA', name: 'Miami', level: 40 },
    ];
    const { text } = await askAI('crowdmesh', venues);
    expect(text).toContain('Atlanta');
    expect(text.toLowerCase()).toContain('dispatch');
  });

  it('recommends a specific cross-venue workforce reallocation', async () => {
    const venues = [
      { id: 'MTY', name: 'Monterrey', level: 20, staff: 40 },
      { id: 'KC', name: 'Kansas City', level: 88, staff: 22 },
    ];
    const { text } = await askAI('workforce', venues);
    expect(text.toLowerCase()).toMatch(/reallocat|steward/);
  });

  it('estimates CO2 savings for the sustainability ledger', async () => {
    const { text } = await askAI('sustainledger', 'Venue: Miami. Transport mode chosen: Metro + shuttle.');
    expect(text).toMatch(/kg/);
  });

  it('rejects an unconfigured mode gracefully', async () => {
    const { text } = await askAI('unknown-mode', 'test');
    expect(text).toMatch(/don't have a demo response/i);
  });
});
