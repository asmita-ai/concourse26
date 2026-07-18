import React, { useState, Suspense, lazy } from 'react';
import NetworkMap from './components/NetworkMap.jsx';
import StatusStrip from './components/StatusStrip.jsx';

// Each module is its own lazy chunk: only the active tab's JS downloads and
// executes on first paint, instead of shipping all six modules upfront.
const JourneyConcierge = lazy(() => import('./components/JourneyConcierge.jsx'));
const CrowdMesh = lazy(() => import('./components/CrowdMesh.jsx'));
const AccessPassport = lazy(() => import('./components/AccessPassport.jsx'));
const Workforce = lazy(() => import('./components/Workforce.jsx'));
const IncidentCorrelation = lazy(() => import('./components/IncidentCorrelation.jsx'));
const SustainLedger = lazy(() => import('./components/SustainLedger.jsx'));

const FEEDS = [
  { id: 'M1', key: 'journey', title: 'Journey Concierge', desc: 'One AI plan spanning a fan\u2019s whole multi-city, multi-match itinerary — routing, transport, sustainability and language, fused.', Component: JourneyConcierge, audience: 'For fans' },
  { id: 'M2', key: 'crowdmesh', title: 'Cross-Venue Crowd Mesh', desc: 'Live density across several host cities at once, with AI flagging cascading risk between venues.', Component: CrowdMesh, audience: 'For organizers' },
  { id: 'M3', key: 'accesspass', title: 'Accessibility Passport', desc: 'A fan\u2019s accessibility profile follows them venue to venue, regenerating a local plan for each one.', Component: AccessPassport, audience: 'For volunteers' },
  { id: 'M4', key: 'workforce', title: 'Workforce Reallocator', desc: 'AI recommends shifting volunteers and stewards between venues and matchdays, not just within one stadium.', Component: Workforce, audience: 'For organizers' },
  { id: 'M5', key: 'incident', title: 'Incident Correlation Engine', desc: 'Triages one report and flags whether the pattern is emerging at other host cities too.', Component: IncidentCorrelation, audience: 'For staff' },
  { id: 'M6', key: 'sustainledger', title: 'Sustainability Ledger', desc: 'Individual green-transport choices roll up into one tournament-wide carbon ledger across 16 venues.', Component: SustainLedger, audience: 'For fans' },
];

export default function App() {
  const [active, setActive] = useState(FEEDS[0].key);
  const feed = FEEDS.find((f) => f.key === active);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">26</span>
            <div>
              Concourse26
              <small>WORLD CUP 2026 · TOURNAMENT INTELLIGENCE</small>
            </div>
          </div>
          <nav aria-label="Primary">
            <a href="#modules">MODULES</a>
            <a href="#about">ABOUT</a>
            <a href="https://github.com/asmita-ai/concourse26" target="_blank" rel="noreferrer">GITHUB</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow"><span className="live" aria-hidden="true" /> LIVE · 16 VENUES · 3 COUNTRIES</div>
            <h1>One tournament. Sixteen cities. <span>One intelligence layer.</span></h1>
            <p className="lede">
              Concourse26 is a GenAI operations layer built for the reality of FIFA World Cup
              2026: fans, staff and incidents don&rsquo;t stay inside one stadium — they move between
              16 venues across the USA, Mexico and Canada. Most tools treat each stadium in
              isolation. Concourse26 connects them.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#modules">Open the console ↓</a>
              <a className="btn" href="#about">Why cross-venue matters</a>
            </div>
            <div className="route-legend">
              <span><i style={{ background: 'var(--us)' }} /> United States · 11 venues</span>
              <span><i style={{ background: 'var(--mx)' }} /> Mexico · 3 venues</span>
              <span><i style={{ background: 'var(--ca)' }} /> Canada · 2 venues</span>
            </div>
          </div>
          <NetworkMap />
        </div>
      </section>

      <StatusStrip />

      <section className="feeds" id="modules">
        <div className="container">
          <div className="feeds-head">
            <div className="kicker">Ops console</div>
            <h2>Six modules, one connected system</h2>
            <p>Every module shares the same GenAI layer and the same tournament-wide view — built for someone coordinating across cities, not just running one gate.</p>
          </div>

          <div className="feed-nav" role="tablist" aria-label="Tournament intelligence modules">
            {FEEDS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={active === f.key}
                className={`feed-chip ${active === f.key ? 'active' : ''}`}
                onClick={() => setActive(f.key)}
              >
                <span className="dot" aria-hidden="true" />
                {f.id} — {f.title}
              </button>
            ))}
          </div>

          <div className="panel" role="tabpanel">
            <div className="panel-head">
              <div>
                <span className="feed-id">{feed.id} · {feed.audience.toUpperCase()}</span>
                <h3>{feed.title}</h3>
              </div>
              <span className="live-tag"><span className="dot" aria-hidden="true" />LIVE</span>
            </div>
            <div className="panel-body">
              <Suspense fallback={<div className="module-loading" role="status">Loading module…</div>}>
                <feed.Component />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="container" style={{ padding: '20px 24px 60px' }}>
        <div className="panel">
          <div className="panel-head">
            <div><span className="feed-id">ABOUT THE BUILD</span><h3>Why cross-venue, and how it&rsquo;s built</h3></div>
          </div>
          <div className="panel-body about-grid">
            <div>
              <strong>The real problem.</strong> World Cup 2026 is the first tournament ever
              spread across three nations and 16 cities. A fan&rsquo;s ticket itinerary, a
              volunteer&rsquo;s shift, and an incident report can all span more than one venue —
              yet most stadium tools are built as if each venue exists alone.
            </div>
            <div>
              <strong>Security-first AI.</strong> Every AI call routes through a serverless
              function (<code>/api/ai</code>) that holds the model API key server-side. The
              browser never sees it — only the model&rsquo;s text response.
            </div>
            <div>
              <strong>Works with or without a key.</strong> If no API key is configured, each
              module automatically falls back to a local &ldquo;demo intelligence&rdquo; layer, clearly
              labeled in the UI, so the console stays fully interactive for anyone testing it.
            </div>
            <div>
              <strong>Accessible by default.</strong> Keyboard-navigable tabs, visible focus
              states, ARIA labels on live regions, reduced-motion support, and a dedicated
              Accessibility Passport module built into the product itself.
            </div>
          </div>
        </div>
      </section>

      <footer className="container">
        <span>Concourse26 — Smart Stadiums &amp; Tournament Operations, built for FIFA World Cup 2026</span>
        <span>Demo build · No real fan data used · Venue list is public FIFA host-city information</span>
      </footer>
    </>
  );
}
