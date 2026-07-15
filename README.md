# Concourse26

**GenAI tournament intelligence for FIFA World Cup 2026 — built for [Challenge 4] Smart Stadiums & Tournament Operations.**

> **Live demo:** _add your deployed URL here_
> **Repo:** _add your GitHub URL here_

## The idea, and why it's different

FIFA World Cup 2026 is the first World Cup ever hosted across **three countries and 16 cities**: Atlanta, Boston, Dallas, Guadalajara, Houston, Kansas City, Los Angeles, Mexico City, Miami, Monterrey, New York/New Jersey, Philadelphia, San Francisco Bay Area, Seattle, Toronto, and Vancouver.

Most "smart stadium" GenAI tools — including plenty of hackathon submissions — treat this like any other single-venue problem: a chatbot for one stadium, a crowd heatmap for one stadium, navigation inside one stadium. That misses what the challenge title actually says: **Tournament** Operations, not just Stadium Operations.

A fan might watch a group match in Houston and a Round-of-16 match in Toronto five days later. A steward shortage in one city might be solvable by shifting volunteers from a lower-demand match elsewhere. A security pattern showing up in one venue is worth checking for at others the same day. **Concourse26 is built around that reality** — six AI modules that all share one cross-venue view, instead of six copies of the same single-stadium tool.

## The six modules

| Module | Who it's for | What makes it cross-venue |
|---|---|---|
| **M1 — Journey Concierge** | Fans | One AI-generated plan spanning a fan's *entire* multi-city itinerary — intercity transport, greenest option, local tips per venue, answered in their language — instead of four separate single-purpose tools |
| **M2 — Cross-Venue Crowd Mesh** | Organizers | Live density across several host cities at once; AI flags cascading risk between venues (shared transit, overlapping end-times, border bottlenecks), not just one stadium's zones |
| **M3 — Accessibility Passport** | Volunteers | A fan's accessibility profile follows them venue to venue; AI regenerates a venue-specific accommodation plan for wherever they're headed next |
| **M4 — Workforce Reallocator** | Organizers | Recommends shifting stewards/volunteers *between* venues and matchdays based on real-time demand, not just within one stadium |
| **M5 — Incident Correlation Engine** | Staff | Triages a single incident report and flags whether the pattern is worth watching for at *other* host cities the same day |
| **M6 — Sustainability Ledger** | Fans | Individual green-transport choices roll up into one running tournament-wide carbon ledger across all 16 venues |

This still covers every area named in the brief — navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, real-time decision support — just organized around the tournament as a connected system rather than 16 disconnected ones.

## Architecture

```
Browser (React/Vite SPA)
   │  fetch('/api/ai', { mode, prompt })
   ▼
/api/ai.js  (Vercel serverless function)
   │  reads process.env.ANTHROPIC_API_KEY  (server-side only)
   ▼
Anthropic Messages API
```

**Security.** The model API key is never bundled into frontend JS and never sent to the browser. It lives only in the serverless function's environment variables. The client only talks to `/api/ai`, which validates the request (`mode` allow-list, prompt length cap, CORS, method check) before forwarding it upstream.

**Resilience / testing.** If no `ANTHROPIC_API_KEY` is configured (e.g. a judge clones the repo with zero setup), `/api/ai` returns `503` and the frontend automatically falls back to a local, input-aware "demo intelligence" layer (`src/lib/ai.js`) — clearly labeled `Demo intelligence` in the UI rather than pretending to be live. Every module stays fully interactive either way, and this fallback path is unit-tested.

**Efficiency.** No heavy UI framework — hand-written CSS with design tokens, a single small React tree, one shared AI-calling function reused by all six modules. Production build is ~56 KB gzipped JS.

**Accessibility.** Keyboard-operable tabs (`role="tab"`/`aria-selected`), visible focus rings, `aria-label`s on inputs, maps, and live regions, `prefers-reduced-motion` support, and a high-contrast/large-text toggle built directly into the Accessibility Passport module.

**Data note.** The 16 host cities and their countries are real, public FIFA World Cup 2026 information. Live congestion levels, staffing numbers, and the running carbon total are simulated for demo purposes — clearly not claimed as real operational data anywhere in the app.

## Project structure

```
├── api/ai.js                    # Serverless proxy to the LLM (key stays server-side)
├── src/
│   ├── App.jsx                  # Console shell / module-tab layout
│   ├── styles.css               # Design tokens + all styling
│   ├── lib/ai.js                # Shared AI client + demo-mode fallback
│   ├── lib/ai.test.js           # Unit tests for AI logic (all 6 modes)
│   ├── lib/venues.js            # Real 16-host-city data + network-map layout
│   ├── App.test.jsx             # Component test for module tab switching
│   └── components/              # NetworkMap, StatusStrip, and one per module
├── vercel.json                   # SPA rewrite rules
└── .env.example
```

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
   - `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com/)
4. Deploy. `api/ai.js` is automatically picked up as a serverless function.
5. Redeploy after adding the key — every module switches from `Demo intelligence` to live `AI-generated` responses, no frontend code changes needed.

## Testing

- `src/lib/ai.test.js` — 7 tests covering the demo-mode fallback for all six modules, including that incident triage correctly classifies a security report as Critical severity and identifies the correct highest-density venue in crowd analysis.
- `src/App.test.jsx` — verifies the console renders all six modules, that tab switching updates the active panel, and that the 16-venue network diagram renders.

Run with `npm test`.

## Roadmap (beyond hackathon scope)

- Real IoT/camera feed integration in place of simulated venue congestion data.
- Persist fan accessibility profiles and journey plans across sessions (with consent) so they genuinely follow a fan venue to venue.
- Real cross-venue incident correlation against a live incident database rather than a single-report heuristic.
- Streaming AI responses for lower perceived latency.

---

Built for the FIFA World Cup 2026 Smart Stadiums & Tournament Operations hackathon challenge.
