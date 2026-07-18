# Concourse26

**GenAI tournament intelligence for FIFA World Cup 2026 — built for [Challenge 4] Smart Stadiums & Tournament Operations.**

> **Live demo:** https://concourse26.vercel.app
> **Repo:** https://github.com/asmita-ai/concourse26

---

## Chosen vertical

Concourse26's primary focus is **Operational Intelligence & Real-Time Decision Support**, applied at the tournament level rather than the single-venue level. It also directly covers **Crowd Management**, **Accessibility**, **Transportation**, **Sustainability**, and **Multilingual Assistance** — the six modules map one-to-one onto these areas (see table below), all sharing one underlying cross-venue data model instead of being built as six disconnected tools.

## Approach and logic

FIFA World Cup 2026 is the first World Cup ever hosted across **three countries and 16 cities**: Atlanta, Boston, Dallas, Guadalajara, Houston, Kansas City, Los Angeles, Mexico City, Miami, Monterrey, New York/New Jersey, Philadelphia, San Francisco Bay Area, Seattle, Toronto, and Vancouver.

Most "smart stadium" GenAI tools treat this like any other single-venue problem: a chatbot for one stadium, a crowd heatmap for one stadium, navigation inside one stadium. That misses what the challenge title actually says: **Tournament** Operations, not just Stadium Operations.

A fan might watch a group match in Houston and a Round-of-16 match in Toronto five days later. A steward shortage in one city might be solvable by shifting volunteers from a lower-demand match elsewhere. A security pattern showing up in one venue is worth checking for at others the same day. **Concourse26's logic is built around that reality**: every module operates on a shared model of all 16 venues (`src/lib/venues.js`), not an isolated single stadium, so recommendations can reference "the other venue" or "the next city on this fan's itinerary" instead of only ever seeing one location in isolation.

## How the solution works

**The six modules:**

| Module | Who it's for | What makes it cross-venue |
|---|---|---|
| **M1 — Journey Concierge** | Fans | One AI-generated plan spanning a fan's *entire* multi-city itinerary — intercity transport, greenest option, local tips per venue, answered in their language — instead of four separate single-purpose tools |
| **M2 — Cross-Venue Crowd Mesh** | Organizers | Live density across several host cities at once; AI flags cascading risk between venues (shared transit, overlapping end-times, border bottlenecks), not just one stadium's zones |
| **M3 — Accessibility Passport** | Volunteers | A fan's accessibility profile follows them venue to venue; AI regenerates a venue-specific accommodation plan for wherever they're headed next |
| **M4 — Workforce Reallocator** | Organizers | Recommends shifting stewards/volunteers *between* venues and matchdays based on real-time demand, not just within one stadium |
| **M5 — Incident Correlation Engine** | Staff | Triages a single incident report and flags whether the pattern is worth watching for at *other* host cities the same day |
| **M6 — Sustainability Ledger** | Fans | Individual green-transport choices roll up into one running tournament-wide carbon ledger across all 16 venues |

**Architecture:**

```
Browser (React/Vite SPA)
   │  fetch('/api/ai', { mode, prompt })
   ▼
/api/ai.js  (Vercel serverless function)
   │  reads process.env.GEMINI_API_KEY  (server-side only)
   ▼
Google Gemini API (gemini-3.5-flash)
```

**Security.** The model API key is never bundled into frontend JS and never sent to the browser. It lives only in the serverless function's environment variables. The client only talks to `/api/ai`, which validates and sanitizes every request (`mode` allow-list, prompt length cap, control-character stripping, CORS, method check — see `shared/validateRequest.js`) before forwarding it upstream, and applies a per-client rate limit (429 responses beyond 20 requests/minute). The deployment also sets explicit HTTP security headers (`vercel.json`): a restrictive Content-Security-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a locked-down Permissions-Policy.

**Resilience / testing.** If no `GEMINI_API_KEY` is configured (e.g. a judge clones the repo with zero setup), `/api/ai` returns `503` and the frontend automatically falls back to a local, input-aware "demo intelligence" layer (`src/lib/ai.js`) — clearly labeled `Demo intelligence` in the UI rather than pretending to be live. Every module stays fully interactive either way. The project has **53 automated tests across 11 test files** — every one of the six modules has dedicated component tests, the shared validation/rate-limiting logic is tested in isolation, the 16-venue dataset has integrity tests, and the codebase passes `eslint` with zero errors or warnings.

**Efficiency.** No heavy UI framework — hand-written CSS with design tokens and one shared AI-calling function reused by all six modules. Each module is also **code-split via `React.lazy`**, so only the active tab's JS (1–3 KB gzipped per module) downloads and executes on first paint instead of shipping all six modules upfront; the shared runtime is ~51 KB gzipped. Identical repeated AI queries within a session are served from an in-memory response cache instead of re-calling the API.

**Accessibility.** A skip-to-console link for keyboard users, keyboard-operable tabs (`role="tab"`/`aria-selected`), visible focus rings, `aria-label`s on inputs/maps, `aria-live="polite"` regions so AI responses are announced to screen readers as they arrive, `prefers-reduced-motion` support, and a high-contrast/large-text toggle built directly into the Accessibility Passport module.

**Project structure:**

```
├── api/ai.js                      # Serverless proxy to Gemini (key stays server-side)
├── shared/
│   ├── systemPrompts.js           # Single source of truth for prompts (no client/server duplication)
│   ├── validateRequest.js         # Pure, unit-tested request validation + rate limiting
│   └── validateRequest.test.js
├── src/
│   ├── App.jsx                    # Console shell / lazy-loaded module-tab layout
│   ├── styles.css                 # Design tokens + all styling
│   ├── lib/ai.js                  # Shared AI client + demo-mode fallback + response cache
│   ├── lib/ai.test.js
│   ├── lib/venues.js              # Real 16-host-city data + network-map layout
│   ├── lib/venues.test.js         # Data-integrity tests for the venue dataset
│   ├── App.test.jsx
│   └── components/                # NetworkMap, StatusStrip, and one per module — each with its own *.test.jsx
├── eslint.config.js                # Zero-warning lint config (React + Hooks rules)
├── vercel.json                     # SPA rewrite rules + HTTP security headers
└── .env.example
```

## Assumptions made

- The 16 host cities and their countries are real, public FIFA World Cup 2026 information. Live congestion levels, staffing numbers, and the running carbon total are **simulated** for demo purposes — clearly labeled and not claimed as real operational data anywhere in the app.
- The inter-city "links" shown in the network diagram are illustrative fan-travel corridors between geographically nearby host cities, not an actual published transit schedule.
- Match itineraries, venue assignments, and incident reports entered by a user are treated as hypothetical scenarios for demonstration, not real fan or staff data.
- Where a judge runs this with no Gemini API key configured, all outputs are clearly labeled `Demo intelligence` rather than silently faking a live AI response — this was a deliberate design choice for transparency and gradeability with zero setup.
- The per-client rate limit on `/api/ai` uses in-memory state scoped to a single serverless function instance. Vercel can run multiple concurrent instances and instances are ephemeral across cold starts, so this is a meaningful deterrent against casual abuse from one client, not a strict global limit — a production deployment would back this with a shared store (e.g. Redis/Upstash) instead. This tradeoff is documented directly in `shared/validateRequest.js`.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173 — runs in demo-intelligence mode
npm test           # run the unit/component test suite
npm run build      # production build → dist/
```

Everything works without an API key — you'll see `Demo intelligence` on AI outputs instead of `AI-generated`.

## Deploy (Vercel, free tier, ~2 minutes)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Vercel auto-detects Vite; no config needed.
3. In **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your free key from [Google AI Studio](https://aistudio.google.com/apikey)
4. Deploy. `api/ai.js` is automatically picked up as a serverless function.
5. Redeploy after adding the key — every module switches from `Demo intelligence` to live `AI-generated` responses, no frontend code changes needed.

## Testing

53 tests across 11 files:

- `shared/validateRequest.test.js` — 14 tests covering request validation, control-character sanitization, unicode preservation for multilingual input, and the rate limiter's sliding window.
- `src/lib/ai.test.js` — 7 tests covering the demo-mode fallback for all six modules, including that incident triage correctly classifies a security report as Critical severity and identifies the correct highest-density venue in crowd analysis.
- `src/lib/venues.test.js` — 6 data-integrity tests for the 16-venue dataset (unique ids, all three countries represented, no dangling links).
- `src/components/*.test.jsx` — dedicated tests for every one of the six modules plus NetworkMap/StatusStrip, covering rendering, presets, form interaction, keyboard submission, and demo-mode labeling.
- `src/App.test.jsx` — verifies the console renders all six modules, that tab switching updates the active panel, and that the 16-venue network diagram renders.

Run with `npm test`. Run `npm run lint` for the zero-warning ESLint check (React + Hooks rules).

## Roadmap (beyond hackathon scope)

- Real IoT/camera feed integration in place of simulated venue congestion data.
- Persist fan accessibility profiles and journey plans across sessions (with consent) so they genuinely follow a fan venue to venue.
- Real cross-venue incident correlation against a live incident database rather than a single-report heuristic.
- Streaming AI responses for lower perceived latency.

---

Built for the FIFA World Cup 2026 Smart Stadiums & Tournament Operations hackathon challenge.
