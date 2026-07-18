// api/ai.js — Vercel Serverless Function
//
// SECURITY NOTE: This is the ONLY place the LLM API key is used. It is read
// from the server-side environment variable GEMINI_API_KEY (set in your
// Vercel project settings → Environment Variables), and is never exposed to
// the browser bundle. The frontend only ever talks to this endpoint.
//
// If no key is configured, we respond with 503 so the frontend's demo-mode
// fallback (src/lib/ai.js) kicks in automatically — the app still works.

import { SYSTEM_PROMPTS } from '../shared/systemPrompts.js';
import { validateRequest, isRateLimited } from '../shared/validateRequest.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Basic abuse mitigation. See shared/validateRequest.js for documented
  // limitations of in-memory rate limiting on serverless infrastructure.
  const clientKey =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (isRateLimited(clientKey)) {
    return res.status(429).json({ error: 'Too many requests, please slow down' });
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

  const validation = validateRequest(body);
  if (!validation.ok) {
    return res.status(validation.status).json({ error: validation.error });
  }
  const { mode, prompt } = validation;

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
