// shared/validateRequest.js
//
// Pure validation/sanitization logic, deliberately separated from api/ai.js
// so it can be unit-tested directly without spinning up a serverless
// handler or mocking `req`/`res`. Kept dependency-free on purpose.

import { ALLOWED_MODES } from './systemPrompts.js';

const MAX_PROMPT_LENGTH = 4000;

// Strips control/non-printable characters (defense against header-injection
// style abuse and malformed input) without touching legitimate unicode
// (accents, non-Latin scripts) needed for the multilingual concierge.
function stripControlChars(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Validates and sanitizes an incoming { mode, prompt } request body.
 * @returns {{ ok: true, mode: string, prompt: string } | { ok: false, status: number, error: string }}
 */
export function validateRequest(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Invalid request body' };
  }

  const { mode, prompt } = body;

  if (typeof mode !== 'string' || !ALLOWED_MODES.has(mode)) {
    return { ok: false, status: 400, error: 'Unknown mode' };
  }

  if (typeof prompt !== 'string' || prompt.length === 0) {
    return { ok: false, status: 400, error: 'Invalid prompt' };
  }

  const cleaned = stripControlChars(prompt).trim();

  if (cleaned.length === 0) {
    return { ok: false, status: 400, error: 'Prompt is empty after sanitization' };
  }
  if (cleaned.length > MAX_PROMPT_LENGTH) {
    return { ok: false, status: 400, error: 'Prompt exceeds maximum length' };
  }

  return { ok: true, mode, prompt: cleaned };
}

/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * LIMITATION (documented intentionally, not hidden): Vercel serverless
 * functions are stateless across cold starts and can run as multiple
 * concurrent instances, so this in-memory map does NOT provide a strict
 * global rate limit — a determined attacker could exceed it by hitting
 * different instances. For a hackathon-scale demo this still meaningfully
 * blocks casual abuse/loops from a single warm instance; a production
 * deployment would back this with Redis/Upstash or Vercel's Edge Config
 * instead. Kept simple and dependency-free here on purpose.
 */
const requestLog = new Map(); // key -> array of timestamps (ms)
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

export function isRateLimited(key, now = Date.now()) {
  const timestamps = (requestLog.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return false;
}

// Exposed for tests only, to reset state between test cases.
export function __resetRateLimitStateForTests() {
  requestLog.clear();
}
