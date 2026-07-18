// src/lib/ai.js
//
// All AI calls go through /api/ai — a serverless function that holds the
// LLM API key server-side (see /api/ai.js). The browser NEVER sees the key.
//
// If /api/ai isn't reachable (no serverless backend, or no API key set),
// we fall back to a local, input-aware "demo intelligence" layer so every
// module still works live with zero setup. This is clearly labeled in the
// UI (`source: 'demo'`) rather than pretending to be live.
//
// Note: the actual prompt text lives in shared/systemPrompts.js and is sent
// to Gemini only by api/ai.js (the server). This file only needs the mode
// names for validation, imported from the same shared module so the client
// and server can never silently drift out of sync.

import { ALLOWED_MODES } from '../../shared/systemPrompts.js';

// In-session response cache: an identical (mode, prompt) pair within the
// same page load reuses the prior result instead of re-calling the API —
// a real efficiency win when a user re-clicks a preset or the same button
// twice. Cleared automatically on page reload (plain in-memory Map).
const responseCache = new Map();

async function callServerAI(mode, userPrompt) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, prompt: userPrompt }),
  });
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  const data = await res.json();
  if (!data.text) throw new Error('Empty AI response');
  return data.text;
}

// ---- Demo intelligence fallback (no backend / no key required) ----

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function pick(arr, seed) { return arr[seed % arr.length]; }

function demoJourney(prompt) {
  const seed = hashSeed(prompt);
  const langHint = /[а-яА-Я]/.test(prompt) ? 'ru' : /[\u4e00-\u9fff]/.test(prompt) ? 'zh'
    : /[\u0600-\u06FF]/.test(prompt) ? 'ar' : /[áéíóúñ¿¡]/i.test(prompt) ? 'es' : 'en';
  const modes = ['a cross-border rail + shuttle combo', 'a regional coach service', 'a direct low-carbon flight paired with metro transfer'];
  const mode = pick(modes, seed);
  const templates = {
    en: `For your route between host cities, ${mode} is the most efficient option and cuts CO2 versus flying+driving separately. At each venue, arrive via the designated fan-transit lane to skip the general queue. Check entry requirements early if your route crosses a border — timing varies by country.`,
    es: `Para tu ruta entre ciudades sede, ${mode} es la opción más eficiente y reduce el CO2 frente a volar y conducir por separado. En cada sede, usa el carril de tránsito para aficionados para evitar la fila general. Si tu ruta cruza una frontera, revisa los requisitos de entrada con antelación.`,
    zh: `对于主办城市之间的路线,${mode}是最高效的选择,比单独乘飞机和开车更能减少碳排放。抵达每个场馆时,请使用指定的球迷通道以避开普通队伍。如果您的路线跨越边境,请提前核实入境要求。`,
    ru: `Для маршрута между городами-организаторами лучший вариант — ${mode}, он снижает выбросы CO2 по сравнению с перелётом и поездкой по отдельности. На каждой арене используйте выделенную полосу для болельщиков. Если маршрут пересекает границу, заранее уточните требования на въезд.`,
    ar: `بالنسبة لمسارك بين المدن المضيفة، يُعد ${mode} الخيار الأكثر كفاءة ويقلل من انبعاثات الكربون مقارنة بالطيران والقيادة بشكل منفصل. في كل ملعب، استخدم ممر المشجعين المخصص لتجنب الطابور العام. إذا كان مسارك يعبر حدودًا، تحقق من متطلبات الدخول مسبقًا.`,
  };
  return templates[langHint];
}

function demoCrowdMesh(venues) {
  const seed = hashSeed(JSON.stringify(venues));
  const sorted = [...venues].sort((a, b) => b.level - a.level);
  const top = sorted[0];
  const second = sorted[1];
  const sameRegionRisk = second && second.level >= 60;
  return `Highest risk: ${top.name} at ${top.level}% capacity — approaching saturation on main concourse.${sameRegionRisk ? ` Cascading risk: ${second.name} is also trending high (${second.level}%) around a similar window — if both venues empty near the same time, shared regional transit could bottleneck.` : ' No significant cross-venue overlap detected right now.'}\nDispatch: Route ${pick([2, 3, 4], seed)} additional stewards to ${top.name}'s main concourse within 10 minutes and pre-stage a transit liaison for the post-match window.`;
}

function demoAccessPass(prompt) {
  const wheelchair = /wheelchair|mobility/i.test(prompt);
  const visual = /vision|blind|visually/i.test(prompt);
  const hearing = /hearing|deaf/i.test(prompt);
  const venueMatch = prompt.match(/venue[:\s]+([A-Za-zÀ-ÿ /]+)/i);
  const venue = venueMatch ? venueMatch[1].trim() : 'this venue';
  if (wheelchair) return `1. Meet the fan at the nearest accessible gate at ${venue} (blue signage).\n2. Radio the accessible-seating steward with the ticket zone.\n3. Offer the accessible shuttle cart if the walk exceeds 150m.\n4. Confirm companion seating is adjacent.\n5. Log the plan so it's ready if this fan's profile appears at their next venue on this itinerary.`;
  if (visual) return `1. Offer an audio-guided escort from the ${venue} ticket gate.\n2. Provide the tactile stadium map at the info point.\n3. Pre-announce seat row/aisle verbally, not just visually.\n4. Offer the audio-description headset for the match feed.\n5. Carry this profile forward to the fan's next host-city venue automatically.`;
  if (hearing) return `1. Offer the visual paging card instead of PA-only alerts at ${venue}.\n2. Direct to seating within sightline of the big screen captions.\n3. Share the text-based help line QR code (localized to this venue's country).\n4. Flag row to safety staff for visual (not audio-only) emergency alerts.\n5. Sync this preference to the fan's profile for future host cities.`;
  return `1. Clarify the specific need with the fan directly at ${venue}.\n2. Match them with the nearest relevant accommodation point.\n3. Offer the shortest accessible route, even if longer in distance.\n4. Log the interaction so the next shift — at this venue or their next one — has context.\n5. Follow up once they are seated.`;
}

function demoWorkforce(venues) {
  const seed = hashSeed(JSON.stringify(venues));
  const sorted = [...venues].sort((a, b) => b.level - a.level);
  const high = sorted[0];
  const low = sorted[sorted.length - 1];
  const count = 4 + (seed % 5);
  return `Reallocate ~${count} stewards from ${low.name} (currently ${low.level}% demand, kickoff has passed) to ${high.name} (${high.level}% demand, gates opening soon). Same-region travel window is feasible before ${high.name}'s next surge. Confirm via the venue liaison before the next shift change.`;
}

function demoIncident(prompt) {
  const seed = hashSeed(prompt);
  const medical = /injur|faint|hurt|medical|sick|bleeding/i.test(prompt);
  const security = /fight|weapon|threat|aggressive|unauthorized/i.test(prompt);
  const lost = /lost|missing (child|kid)|can't find/i.test(prompt);
  let severity = 'Low', category = 'Other', route = 'General Operations';
  if (medical) { severity = 'High'; category = 'Medical'; route = 'Medical Response Team'; }
  else if (security) { severity = 'Critical'; category = 'Security'; route = 'Security Control Room'; }
  else if (lost) { severity = 'Medium'; category = 'Lost & Found / Welfare'; route = 'Fan Welfare Desk'; }
  else if (/crowd|congest|blocked|bottleneck/i.test(prompt)) { severity = 'Medium'; category = 'Crowd'; route = 'Crowd Control Desk'; }
  const pattern = severity === 'Critical' || severity === 'High'
    ? 'Worth a same-day check-in with other host cities in case this is part of a broader pattern.'
    : 'None flagged — appears isolated to this venue.';
  return `SEVERITY: ${severity}\nCATEGORY: ${category}\nROUTE TO: ${route}\nCROSS-VENUE PATTERN: ${pattern}\nGuidance: ${pick(['Dispatch nearest available unit and confirm arrival within 3 minutes.', 'Escalate immediately and hold position until responders arrive.', 'Log and monitor; revisit if unresolved in 10 minutes.'], seed)}`;
}

function demoSustainLedger(prompt) {
  const seed = hashSeed(prompt);
  const co2 = (1.2 + (seed % 6) * 0.35).toFixed(1);
  return `Estimated CO2 saved on this leg: ~${co2} kg versus driving alone. Multiply that across a tournament with 16 venues and millions of traveling fans — every mode-shift like this adds up to a measurably lighter footprint for World Cup 2026 as a whole.`;
}

function runDemo(mode, prompt, payload) {
  switch (mode) {
    case 'journey': return demoJourney(prompt);
    case 'crowdmesh': return demoCrowdMesh(payload);
    case 'accesspass': return demoAccessPass(prompt);
    case 'workforce': return demoWorkforce(payload);
    case 'incident': return demoIncident(prompt);
    case 'sustainledger': return demoSustainLedger(prompt);
    default: return "I don't have a demo response configured for this module yet.";
  }
}

/**
 * Unified entry point used by every module.
 * @param {string} mode - one of the six module keys (see shared/systemPrompts.js)
 * @param {string|object} payload - prompt string, or structured data (e.g. venue arrays)
 * @returns {Promise<{text: string, source: 'live'|'demo'}>}
 */
export async function askAI(mode, payload) {
  if (!ALLOWED_MODES.has(mode)) {
    return { text: "I don't have a demo response configured for this module yet.", source: 'demo' };
  }

  const prompt = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const cacheKey = `${mode}:${prompt}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  let result;
  try {
    const text = await callServerAI(mode, prompt);
    result = { text, source: 'live' };
  } catch {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    result = { text: runDemo(mode, prompt, payload), source: 'demo' };
  }

  responseCache.set(cacheKey, result);
  return result;
}
