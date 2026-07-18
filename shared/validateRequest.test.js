import { describe, it, expect } from 'vitest';
import { sanitizePrompt, validateBody, RateLimiter, resolveAllowedOrigin } from './validateRequest.js';

const MODES = new Set(['journey', 'crowdmesh', 'incident']);

describe('sanitizePrompt', () => {
  it('strips ASCII control characters', () => {
    expect(sanitizePrompt('hello\x00world\x1F!')).toBe('helloworld!');
  });

  it('preserves newlines and tabs', () => {
    expect(sanitizePrompt('line one\nline two\tindented')).toBe('line one\nline two\tindented');
  });

  it('preserves unicode content for multilingual input', () => {
    const input = '东京から大阪へ, أهلا وسهلا, Привет мир, Café résumé';
    expect(sanitizePrompt(input)).toBe(input);
  });

  it('enforces a 4000-character length cap', () => {
    const long = 'a'.repeat(5000);
    expect(sanitizePrompt(long).length).toBe(4000);
  });

  it('returns an empty string for non-string input', () => {
    expect(sanitizePrompt(null)).toBe('');
    expect(sanitizePrompt(undefined)).toBe('');
    expect(sanitizePrompt(42)).toBe('');
  });
});

describe('validateBody', () => {
  it('accepts a well-formed request', () => {
    const result = validateBody({ mode: 'journey', prompt: 'Origin: Dallas.' }, MODES);
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('journey');
    expect(result.prompt).toBe('Origin: Dallas.');
  });

  it('rejects a missing body', () => {
    expect(validateBody(null, MODES).ok).toBe(false);
    expect(validateBody(undefined, MODES).ok).toBe(false);
  });

  it('rejects a mode outside the allow-list', () => {
    const result = validateBody({ mode: 'delete-database', prompt: 'x' }, MODES);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/mode/i);
  });

  it('rejects a missing prompt', () => {
    const result = validateBody({ mode: 'journey' }, MODES);
    expect(result.ok).toBe(false);
  });

  it('rejects a whitespace-only prompt', () => {
    const result = validateBody({ mode: 'journey', prompt: '   ' }, MODES);
    expect(result.ok).toBe(false);
  });

  it('sanitizes the prompt before returning it', () => {
    const result = validateBody({ mode: 'journey', prompt: 'hi\x00there' }, MODES);
    expect(result.ok).toBe(true);
    expect(result.prompt).toBe('hithere');
  });
});

describe('RateLimiter', () => {
  it('allows requests under the limit', () => {
    const rl = new RateLimiter({ limit: 3, windowMs: 60_000 });
    const now = 1_000_000;
    expect(rl.check('client-a', now).allowed).toBe(true);
    expect(rl.check('client-a', now + 10).allowed).toBe(true);
    expect(rl.check('client-a', now + 20).allowed).toBe(true);
  });

  it('blocks the request that exceeds the limit within the window', () => {
    const rl = new RateLimiter({ limit: 2, windowMs: 60_000 });
    const now = 2_000_000;
    rl.check('client-b', now);
    rl.check('client-b', now + 10);
    const third = rl.check('client-b', now + 20);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it('resets after the window has fully elapsed', () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 1000 });
    const now = 5_000_000;
    expect(rl.check('client-c', now).allowed).toBe(true);
    expect(rl.check('client-c', now + 500).allowed).toBe(false);
    expect(rl.check('client-c', now + 1500).allowed).toBe(true);
  });

  it('tracks separate clients independently', () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 60_000 });
    const now = 9_000_000;
    expect(rl.check('client-x', now).allowed).toBe(true);
    expect(rl.check('client-y', now).allowed).toBe(true);
    expect(rl.check('client-x', now + 1).allowed).toBe(false);
  });
});

describe('resolveAllowedOrigin', () => {
  it('returns null when no origin header is present', () => {
    expect(resolveAllowedOrigin(undefined, ['https://concourse26.vercel.app'])).toBeNull();
  });

  it('returns the origin when it is on the allow-list', () => {
    const allowed = ['https://concourse26.vercel.app'];
    expect(resolveAllowedOrigin('https://concourse26.vercel.app', allowed)).toBe('https://concourse26.vercel.app');
  });

  it('returns null for an origin not on the allow-list, denying it', () => {
    const allowed = ['https://concourse26.vercel.app'];
    expect(resolveAllowedOrigin('https://evil-scraper.example', allowed)).toBeNull();
  });
});
