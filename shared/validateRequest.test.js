import { describe, it, expect, beforeEach } from 'vitest';
import { validateRequest, isRateLimited, __resetRateLimitStateForTests } from './validateRequest.js';

describe('validateRequest', () => {
  it('accepts a well-formed request', () => {
    const result = validateRequest({ mode: 'journey', prompt: 'Origin: Chicago.' });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('journey');
    expect(result.prompt).toBe('Origin: Chicago.');
  });

  it('rejects a missing body', () => {
    const result = validateRequest(null);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  it('rejects an unknown mode', () => {
    const result = validateRequest({ mode: 'not-a-real-mode', prompt: 'hello' });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/mode/i);
  });

  it('rejects a missing prompt', () => {
    const result = validateRequest({ mode: 'journey' });
    expect(result.ok).toBe(false);
  });

  it('rejects an empty-string prompt', () => {
    const result = validateRequest({ mode: 'journey', prompt: '' });
    expect(result.ok).toBe(false);
  });

  it('rejects a prompt over the maximum length', () => {
    const result = validateRequest({ mode: 'journey', prompt: 'a'.repeat(4001) });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/length/i);
  });

  it('accepts a prompt exactly at the maximum length', () => {
    const result = validateRequest({ mode: 'journey', prompt: 'a'.repeat(4000) });
    expect(result.ok).toBe(true);
  });

  it('strips control characters from the prompt without touching real content', () => {
    const dirty = 'Origin: Chicago\x00\x07 to Dallas';
    const result = validateRequest({ mode: 'journey', prompt: dirty });
    expect(result.ok).toBe(true);
    // eslint-disable-next-line no-control-regex
    expect(result.prompt).not.toMatch(/[\x00-\x08]/);
    expect(result.prompt).toContain('Origin: Chicago');
    expect(result.prompt).toContain('to Dallas');
  });

  it('preserves non-Latin unicode needed for multilingual input', () => {
    const result = validateRequest({ mode: 'journey', prompt: '¿Dónde está la parada de taxis? 你好' });
    expect(result.ok).toBe(true);
    expect(result.prompt).toContain('¿Dónde está');
    expect(result.prompt).toContain('你好');
  });

  it('rejects a prompt that becomes empty after sanitization', () => {
    const result = validateRequest({ mode: 'journey', prompt: '\x00\x01\x02' });
    expect(result.ok).toBe(false);
  });
});

describe('isRateLimited', () => {
  beforeEach(() => {
    __resetRateLimitStateForTests();
  });

  it('allows requests under the limit', () => {
    const now = Date.now();
    for (let i = 0; i < 19; i++) {
      expect(isRateLimited('client-a', now)).toBe(false);
    }
  });

  it('blocks a client once they exceed the per-window limit', () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      isRateLimited('client-b', now);
    }
    expect(isRateLimited('client-b', now)).toBe(true);
  });

  it('tracks separate clients independently', () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) isRateLimited('client-c', now);
    expect(isRateLimited('client-c', now)).toBe(true);
    expect(isRateLimited('client-d', now)).toBe(false);
  });

  it('resets once the sliding window has passed', () => {
    const t0 = Date.now();
    for (let i = 0; i < 20; i++) isRateLimited('client-e', t0);
    expect(isRateLimited('client-e', t0)).toBe(true);
    const later = t0 + 61_000; // just past the 60s window
    expect(isRateLimited('client-e', later)).toBe(false);
  });
});
