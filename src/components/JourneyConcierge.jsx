import React, { useState } from 'react';
import { useAIAction } from '../hooks/useAIAction.js';
import { VENUES, COUNTRY_NAMES } from '../lib/venues.js';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

const STARTERS = [
  { origin: 'Chicago', legs: ['Dallas', 'Atlanta'], note: 'Group stage then Round of 16, 5 days apart' },
  { origin: 'London', legs: ['Mexico City', 'Houston'], note: 'Two group matches, different countries' },
  { origin: 'Vancouver resident', legs: ['Vancouver', 'Seattle'], note: 'Cross-border day trip' },
];

export default function JourneyConcierge() {
  const [origin, setOrigin] = useState('Chicago');
  const [venueA, setVenueA] = useState('Dallas');
  const [venueB, setVenueB] = useState('Atlanta');
  const [note, setNote] = useState('Group stage match, then a Round of 16 match 5 days later');
  const { loading, result, source, run } = useAIAction();

  function plan(preset) {
    const o = preset?.origin ?? origin;
    const a = preset?.legs?.[0] ?? venueA;
    const b = preset?.legs?.[1] ?? venueB;
    const n = preset?.note ?? note;
    if (preset) { setOrigin(o); setVenueA(a); setVenueB(b); setNote(n); }
    const prompt = `Origin: ${o}. Itinerary: ${a} then ${b}. Notes: ${n}.`;
    run('journey', prompt);
  }

  const cA = VENUES.find((v) => v.name === venueA)?.country;
  const cB = VENUES.find((v) => v.name === venueB)?.country;

  return (
    <div>
      <ModuleIntro>
        One plan spanning a fan&rsquo;s whole tournament — not four separate tools for routing, transport, sustainability and language.
      </ModuleIntro>
      <div className="grid-3">
        <div>
          <label className="field-label" htmlFor="jc-origin">Traveling from</label>
          <input id="jc-origin" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="jc-a">First match venue</label>
          <select id="jc-a" value={venueA} onChange={(e) => setVenueA(e.target.value)}>
            {VENUES.map((v) => <option key={v.id}>{v.name}</option>)}
          </select>
          {cA && <span className={`pill ${cA}`} style={{ marginTop: 6 }}><i />{COUNTRY_NAMES[cA]}</span>}
        </div>
        <div>
          <label className="field-label" htmlFor="jc-b">Next match venue</label>
          <select id="jc-b" value={venueB} onChange={(e) => setVenueB(e.target.value)}>
            {VENUES.map((v) => <option key={v.id}>{v.name}</option>)}
          </select>
          {cB && <span className={`pill ${cB}`} style={{ marginTop: 6 }}><i />{COUNTRY_NAMES[cB]}</span>}
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label className="field-label" htmlFor="jc-note">Notes (dates, party size, anything relevant)</label>
        <input id="jc-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => plan()} disabled={loading}>
        {loading ? 'Planning…' : 'Generate cross-city journey plan'}
      </button>
      <div className="toggle-row" style={{ marginTop: 12 }}>
        {STARTERS.map((s, i) => (
          <button key={i} className="toggle" onClick={() => plan(s)}>{s.origin} → {s.legs.join(' → ')}</button>
        ))}
      </div>
      {result && (
        <AIOutputPanel tag={aiTag(source, 'AI-generated journey plan')}>
          {result}
        </AIOutputPanel>
      )}
    </div>
  );
}
