// api/ai.js — Vercel Serverless Function
//
// SECURITY NOTE: This is the ONLY place the LLM API key is used. It is read
// from the server-side environment variable GEMINI_API_KEY (set in your
// Vercel project settings → Environment Variables), and is never exposed to
// the browser bundle. The frontend only ever talks to this endpoint.
//
// If no key is configured, we respond with 503 so the frontend's demo-mode
// fallback (src/lib/ai.js) kicks in automatically — the app still works.
//
// This module is intentionally thin: request validation, sanitization, and
// rate limiting live in shared/validateRequest.js so they're unit-testable
// in isolation, and the prompt text lives in shared/systemPrompts.js so
// there is exactly one copy of each module's instructions.

import { SYSTEM_PROMPTS, ALLOWED_MODES } from '../shared/systemPrompts.js';
import { validateBody, RateLimiter, resolveAllowedOrigin } from '../shared/validateRequest.js';

// Reused across invocations of the same warm serverless instance (see the
// tradeoff note in shared/validateRequest.js). A cold start gets a fresh,
// empty limiter, which is the correct behavior for this instance.
const limiter = new RateLimiter({ limit: 20, windowMs: 60_000 });

// Same-origin requests from the deployed SPA don't require CORS headers at
// all. ALLOWED_ORIGINS only matters for the rare legitimate cross-origin
// case (e.g. a preview deployment calling a shared backend); everything
// else is denied instead of the previous `Access-Control-Allow-Origin: *`,
// which let any website on the internet spend this deployment's Gemini quota.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function getClientKey(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = resolveAllowedOrigin(origin, ALLOWED_ORIGINS);
  if (allowOrigin) res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientKey = getClientKey(req);
  const rate = limiter.check(clientKey);
  res.setHeader('X-RateLimit-Limit', String(limiter.limit));
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(Math.ceil(rate.retryAfterMs / 1000)));
    return res.status(429).json({ error: 'Rate limit exceeded. Try again shortly.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No key configured — let the frontend fall back to demo mode.
    return res.status(503).json({ error: 'AI backend not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const validated = validateBody(body, ALLOWED_MODES);
  if (!validated.ok) {
    return res.status(400).json({ error: validated.error });
  }
  const { mode, prompt } = validated;

  try {
    const model = 'gemini-3.5-flash';
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[mode] }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingLevel: 'low' },
          },
        }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Gemini API error:', upstream.status, errText);
      return res.status(502).json({ error: 'Upstream AI error' });
    }

    const data = await upstream.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('\n')
      .trim();

    if (!text) return res.status(502).json({ error: 'Empty AI response' });
    return res.status(200).json({ text });
  } catch (err) {
    console.error('AI proxy failure:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
