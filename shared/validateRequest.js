// shared/validateRequest.js
//
// Pure, unit-tested request handling for api/ai.js:
//   1. sanitizePrompt   — strips control characters, enforces a length cap,
//                         preserves unicode (so multilingual input still works)
//   2. validateBody     — checks { mode, prompt } shape against the allowed
//                         mode list
//   3. RateLimiter       — a small sliding-window limiter, given its own Map
//                         so it's easy to test in isolation and easy to
//                         instantiate fresh per serverless function instance
//
// KNOWN TRADEOFF: the rate limiter's state is in-memory, scoped to a single
// serverless function instance. Vercel can run multiple concurrent instances,
// and instances are ephemeral across cold starts, so this is a meaningful
// deterrent against casual single-client abuse, not a strict global limit.
// A production deployment would back this with a shared store (e.g.
// Redis/Upstash) instead.

const MAX_PROMPT_LENGTH = 4000;

/**
 * Strip ASCII control characters (except \n and \t) while leaving all
 * unicode content — including non-Latin scripts used by multilingual
 * fans — fully intact, and cap the length.
 * @param {string} input
 * @returns {string}
 */
export function sanitizePrompt(input) {
  if (typeof input !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const stripped = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return stripped.slice(0, MAX_PROMPT_LENGTH);
}

/**
 * Validate the shape of an incoming { mode, prompt } request body.
 * @param {unknown} body
 * @param {Set<string>} allowedModes
 * @returns {{ ok: true, mode: string, prompt: string } | { ok: false, error: string }}
 */
export function validateBody(body, allowedModes) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const { mode, prompt } = body;
  if (typeof mode !== 'string' || !allowedModes.has(mode)) {
    return { ok: false, error: 'Unknown or missing mode' };
  }
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { ok: false, error: 'Missing prompt' };
  }
  const clean = sanitizePrompt(prompt);
  if (clean.length === 0) {
    return { ok: false, error: 'Prompt was empty after sanitization' };
  }
  return { ok: true, mode, prompt: clean };
}

/**
 * Small sliding-window rate limiter. Each instance owns its own store, so
 * tests (and each serverless function instance) get fresh, isolated state.
 */
export class RateLimiter {
  /**
   * @param {{ limit?: number, windowMs?: number, store?: Map<string, number[]> }} [opts]
   */
  constructor({ limit = 20, windowMs = 60_000, store = new Map() } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.store = store;
  }

  /**
   * @param {string} key - typically the client IP
   * @param {number} [now]
   * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
   */
  check(key, now = Date.now()) {
    const windowStart = now - this.windowMs;
    const timestamps = (this.store.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= this.limit) {
      const retryAfterMs = timestamps[0] + this.windowMs - now;
      this.store.set(key, timestamps);
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) };
    }

    timestamps.push(now);
    this.store.set(key, timestamps);
    return { allowed: true, remaining: this.limit - timestamps.length, retryAfterMs: 0 };
  }
}

/**
 * Decide whether a request's Origin header should be allowed to call the
 * API, instead of the blanket `Access-Control-Allow-Origin: *` this project
 * originally shipped with (which let any website spend the deployment's
 * Gemini quota). Same-origin browser requests to a Vercel deployment don't
 * send an Origin header that needs special-casing at all; this only matters
 * for cross-origin callers, which we don't want to allow by default.
 * @param {string | undefined} origin
 * @param {string[]} allowedOrigins
 * @returns {string | null} the origin to echo back, or null to omit the header (deny)
 */
export function resolveAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return null;
  return allowedOrigins.includes(origin) ? origin : null;
}
