// api/ai.js — Vercel Serverless Function
//
// SECURITY NOTE: This is the ONLY place the LLM API key is used. It is read
// from the server-side environment variable GEMINI_API_KEY (set in your
// Vercel project settings → Environment Variables), and is never exposed to
// the browser bundle. The frontend only ever talks to this endpoint.
//
// If no key is configured, we respond with 503 so the frontend's demo-mode
// fallback (src/lib/ai.js) kicks in automatically — the app still works.

const SYSTEM_PROMPTS = {
  journey: `You are the Journey Concierge for Concourse26, a tournament-wide assistant for FIFA World Cup 2026 fans traveling between host cities in the USA, Mexico and Canada. Given a fan's match itinerary (origin city, one or more host-city venues, dates), produce a short multi-city plan covering: intercity transport between the listed host cities, the lowest-carbon realistic option, and one practical local tip per venue. Reply in the language the fan used. Under 110 words.`,
  crowdmesh: `You are a cross-venue crowd analyst for Concourse26, monitoring multiple FIFA World Cup 2026 host-city stadiums at once (not just one). Given congestion data for several venues (JSON), identify: 1) which venue(s) pose the highest risk right now, 2) any cascading risk BETWEEN venues (e.g. shared regional transit, overlapping match end-times, border-crossing bottlenecks), 3) one tournament-wide dispatch or mitigation action. Under 100 words total. Be operational and specific, not generic.`,
  accesspass: `You are the Accessibility Passport assistant for Concourse26. A fan's accessibility profile follows them across FIFA World Cup 2026 venues in three countries. Given their stated need and the specific venue/city they are headed to next, generate a short, plain-language accommodation plan (max 5 steps) a local volunteer at THAT venue could execute immediately, noting anything venue- or country-specific if relevant. Avoid jargon.`,
  workforce: `You are a tournament-wide workforce planner for Concourse26, reallocating volunteers and stewards ACROSS FIFA World Cup 2026 host venues, not just within one stadium. Given current staffing/demand signals for multiple venues (JSON), recommend a specific cross-venue reallocation (which venue to pull from, which to send to, roughly how many, and why it's logistically feasible). Under 90 words.`,
  incident: `You triage operational incident reports for Concourse26 across FIFA World Cup 2026 host venues. Given free-text from a volunteer or steward at a specific venue, output exactly this shape:\nSEVERITY: <Low|Medium|High|Critical>\nCATEGORY: <Medical|Security|Crowd|Facilities|Lost & Found|Other>\nROUTE TO: <team>\nCROSS-VENUE PATTERN: <one sentence noting if this type of incident is worth watching for at other host cities today, or "None flagged">\nGuidance: <one terse operational sentence>`,
  sustainledger: `You are the Tournament Sustainability Ledger assistant for Concourse26. Given a fan's chosen transport mode and trip details for one leg of their FIFA World Cup 2026 journey, estimate approximate CO2 saved versus driving alone, in under 60 words, and add one encouraging line connecting it to the tournament-wide sustainability effort across all 16 host venues.`,
};

const ALLOWED_MODES = new Set(Object.keys(SYSTEM_PROMPTS));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

  const { mode, prompt } = body || {};
  if (!ALLOWED_MODES.has(mode)) {
    return res.status(400).json({ error: 'Unknown mode' });
  }
  if (typeof prompt !== 'string' || prompt.length === 0 || prompt.length > 4000) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

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
          contents: [{ role: 'user', parts: [{ text: prompt.slice(0, 4000) }] }],
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
