# Concourse26

**GenAI tournament intelligence for FIFA World Cup 2026 — built for [Challenge 4] Smart Stadiums & Tournament Operations.**

> **Live demo:** https://concourse26.vercel.app
> **Repo:** https://github.com/asmita-ai/concourse26

---

## Chosen vertical

Concourse26's primary focus is **Operational Intelligence & Real-Time Decision Support**, applied at the tournament level rather than the single-venue level. It also directly covers **Crowd Management**, **Accessibility**, **Transportation**, **Sustainability**, and **Multilingual Assistance** — the six modules map one-to-one onto these areas (see table below), all sharing one underlying cross-venue data model instead of being built as six disconnected tools.

**Coverage against every area named in the challenge brief:**

| Challenge area | Covered by |
|---|---|
| Navigation | M1 Journey Concierge (inter-venue routing) |
| Crowd management | M2 Cross-Venue Crowd Mesh |
| Accessibility | M3 Accessibility Passport |
| Transportation | M1 Journey Concierge, M6 Sustainability Ledger |
| Sustainability | M6 Sustainability Ledger |
| Multilingual assistance | M1 Journey Concierge (replies in the fan's own language) |
| Operational intelligence | M4 Workforce Reallocator, M5 Incident Correlation Engine |
| Real-time decision support | All six modules — every AI call takes live-shaped input (current density, current demand, a just-filed report) and returns an immediately actionable recommendation |

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
   │  validates + rate-limits via shared/validateRequest.js
   │  reads process.env.GEMINI_API_KEY  (server-side only)
   ▼
Google Gemini API (gemini-3.5-flash)
```

**Security.** The model API key is never bundled into frontend JS and never sent to the browser. It lives only in the serverless function's environment variables. The client only talks to `/api/ai`, which validates and sanitizes every request (`shared/validateRequest.js`: mode allow-list, prompt length cap, control-character stripping while preserving unicode for multilingual input) before forwarding it upstream, and applies a per-client sliding-window rate limit (429 responses beyond 20 requests/minute per client IP). CORS is origin-restricted rather than wide open — `Access-Control-Allow-Origin` is only set for origins on an explicit allow-list (`ALLOWED_ORIGINS` env var), not `*`, so the endpoint (and your Gemini quota) can't be called from an arbitrary third-party site; same-origin requests from the deployed SPA don't need CORS headers at all. The deployment also sets explicit HTTP security headers (`vercel.json`): a restrictive Content-Security-Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a locked-down Permissions-Policy.

**Code quality.** The six AI-backed modules previously duplicated the same loading/result/source state and the same "call the AI, store what comes back" logic six separate times, and the density-tier classification (`level >= 75` → high risk) existed as a named function in one module while being silently re-typed as a raw duplicate ternary in another — the kind of drift-prone duplication that makes a codebase harder to maintain. Both are now single implementations: `src/hooks/useAIAction.js` (shared AI-call state) and `src/lib/density.js` (shared tier thresholds), each unit-tested and imported everywhere they're needed. Two small shared presentational components, `ModuleIntro` and `AIOutputPanel`, replace an identical block of inline styles and markup that was copy-pasted into five and six files respectively.

**Resilience / testing.** If no `GEMINI_API_KEY` is configured (e.g. a judge clones the repo with zero setup), `/api/ai` returns `503` and the frontend automatically falls back to a local, input-aware "demo intelligence" layer (`src/lib/ai.js`) — clearly labeled `Demo intelligence` in the UI rather than pretending to be live. Every module stays fully interactive either way. The project has **72 automated tests across 14 test files** — every one of the six modules has dedicated component tests, `NetworkMap`/`StatusStrip`/`ModuleIntro`/`AIOutputPanel` are tested, the shared `useAIAction` hook and `density` util are unit-tested in isolation, the shared validation/sanitization/rate-limiting logic has 18 dedicated tests, the 16-venue dataset has data-integrity tests, and the codebase passes `eslint` with zero errors or warnings.

**Efficiency.** No heavy UI framework — hand-written CSS with design tokens and one shared AI-calling function reused by all six modules. Each module is **code-split via `React.lazy`** behind a `Suspense` boundary, so only the active tab's JS downloads and executes on first paint instead of shipping all six modules upfront — verified in the production build, each module chunk is under 3.1 KB gzipped, with a ~50 KB gzipped shared runtime. Identical repeated `(mode, prompt)` AI queries within a session are served from an in-memory response cache (`src/lib/ai.js`) instead of re-calling the API.

**Accessibility.** A skip-to-console link for keyboard users, keyboard-operable tabs (`role="tab"`/`aria-selected`), visible focus rings, `aria-label`s on inputs/maps, `aria-live="polite"` regions so AI responses are announced to screen readers as they arrive, `prefers-reduced-motion` support, and a high-contrast/large-text toggle built directly into the Accessibility Passport module.

**Project structure:**

```
├── api/ai.js                       # Serverless proxy to Gemini (key stays server-side)
├── shared/
│   ├── systemPrompts.js            # Single source of truth for the model instructions
│   ├── validateRequest.js          # Pure, unit-tested validation, sanitization, rate limiting
│   └── validateRequest.test.js
├── src/
│   ├── App.jsx                     # Console shell / React.lazy module-tab layout
│   ├── styles.css                  # Design tokens + all styling
│   ├── hooks/
│   │   ├── useAIAction.js          # Shared loading/result/source state for all AI-backed modules
│   │   └── useAIAction.test.js
│   ├── lib/ai.js                   # Shared AI client + demo-mode fallback + response cache
│   ├── lib/ai.test.js
│   ├── lib/venues.js               # Real 16-host-city data + network-map layout
│   ├── lib/venues.test.js          # Data-integrity tests for the venue dataset
│   ├── lib/density.js              # Shared crowd/demand tier thresholds (single source of truth)
│   ├── lib/density.test.js
│   ├── App.test.jsx
│   └── components/
│       ├── ModuleIntro.jsx          # Shared module explainer paragraph
│       ├── AIOutputPanel.jsx        # Shared AI-result panel
│       ├── AIOutputPanel.test.jsx
│       └── ...                      # NetworkMap, StatusStrip, and one per module — each with its own *.test.jsx
├── eslint.config.js                 # Zero-warning lint config (React + Hooks rules)
├── vercel.json                      # SPA rewrite rules + HTTP security headers
└── .env.example
```

## Assumptions made

- The 16 host cities and their countries are real, public FIFA World Cup 2026 information. Live congestion levels, staffing numbers, and the running carbon total are **simulated** for demo purposes — clearly labeled and not claimed as real operational data anywhere in the app.
- The inter-city "links" shown in the network diagram are illustrative fan-travel corridors between geographically nearby host cities, not an actual published transit schedule.
- Match itineraries, venue assignments, and incident reports entered by a user are treated as hypothetical scenarios for demonstration, not real fan or staff data.
- Where a judge runs this with no Gemini API key configured, all outputs are clearly labeled `Demo intelligence` rather than silently faking a live AI response — this was a deliberate design choice for transparency and gradeability with zero setup.
- The per-client rate limit on `/api/ai` uses in-memory state scoped to a single serverless function instance. Vercel can run multiple concurrent instances and instances are ephemeral across cold starts, so this is a meaningful deterrent against casual abuse from one client, not a strict global limit — a production deployment would back this with a shared store (e.g. Redis/Upstash) instead. This tradeoff is documented directly in `shared/validateRequest.js`.
- `ALLOWED_ORIGINS` is optional and only needed for genuine cross-origin use (e.g. a second deployment sharing this backend); a normal single-deployment setup doesn't need it since the SPA calling its own `/api/ai` is same-origin.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173 — runs in demo-intelligence mode
npm test           # run the unit/component test suite
npm run lint       # zero-warning ESLint check
npm run build      # production build → dist/
```

Everything works without an API key — you'll see `Demo intelligence` on AI outputs instead of `AI-generated`.

## Deploy (Vercel, free tier, ~2 minutes)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Vercel auto-detects Vite; no config needed.
3. In **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your free key from [Google AI Studio](https://aistudio.google.com/apikey)
   - *(optional)* `ALLOWED_ORIGINS` = your deployment URL, only if another origin needs to call this backend
4. Deploy. `api/ai.js` is automatically picked up as a serverless function.
5. Redeploy after adding the key — every module switches from `Demo intelligence` to live `AI-generated` responses, no frontend code changes needed.

## Testing

72 tests across 14 files:

- `shared/validateRequest.test.js` — 18 tests covering prompt sanitization (control-character stripping with unicode preservation for multilingual input), request-shape validation against the mode allow-list, the sliding-window rate limiter, and CORS origin resolution.
- `src/lib/ai.test.js` — 7 tests covering the demo-mode fallback for all six modules, including that incident triage correctly classifies a security report as Critical severity and identifies the correct highest-density venue in crowd analysis.
- `src/lib/venues.test.js` — 9 data-integrity tests for the 16-venue dataset (unique ids, all three countries represented, no dangling or self-referencing links).
- `src/lib/density.test.js` — 3 tests for the shared crowd/demand tier thresholds.
- `src/hooks/useAIAction.test.js` — 3 tests for the shared AI-call state hook (idle state, loading transition, reset).
- `src/components/AIOutputPanel.test.jsx` — 5 tests for the shared intro/output components and the `aiTag` helper.
- `src/components/*.test.jsx` — dedicated tests for every one of the six modules plus NetworkMap/StatusStrip, covering rendering, presets, form interaction, keyboard submission, toggles, and demo-mode labeling.
- `src/App.test.jsx` — verifies the console renders all six modules, that tab switching updates the active panel, and that the 16-venue network diagram renders.

Run with `npm test`. Run `npm run lint` for the zero-warning ESLint check (React + Hooks rules).

## Roadmap (beyond hackathon scope)

- Real IoT/camera feed integration in place of simulated venue congestion data.
- Persist fan accessibility profiles and journey plans across sessions (with consent) so they genuinely follow a fan venue to venue.
- Real cross-venue incident correlation against a live incident database rather than a single-report heuristic.
- Streaming AI responses for lower perceived latency.
- Back the rate limiter with a shared store (Redis/Upstash) for a true global limit across serverless instances.

---

Built for the FIFA World Cup 2026 Smart Stadiums & Tournament Operations hackathon challenge.
