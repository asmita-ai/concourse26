import React, { useState } from 'react';
import { askAI } from '../lib/ai.js';
import { VENUES } from '../lib/venues.js';

function makeDemand() {
  const active = VENUES.slice(4, 10);
  return active.map((v) => ({ ...v, level: Math.floor(15 + Math.random() * 82), staff: 20 + Math.floor(Math.random() * 40) }));
}

export default function Workforce() {
  const [venues, setVenues] = useState(makeDemand);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);

  function refresh() { setVenues(makeDemand()); setResult(null); }

  async function analyze() {
    setLoading(true);
    const { text, source } = await askAI('workforce', venues.map(({ id, name, country, level, staff }) => ({ id, name, country, demandPct: level, staffOnSite: staff })));
    setResult(text);
    setSource(source);
    setLoading(false);
  }

  return (
    <div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginTop: 0 }}>
        Reallocates volunteers and stewards <em>between</em> venues and matchdays, not just within one stadium.
      </p>
      <div className="grid-3">
        {venues.map((v) => (
          <div key={v.id} className="venue-tile">
            <div className="vname"><span>{v.name}</span><span className={`pill ${v.country}`}><i />{v.id}</span></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>
              Demand {v.level}% · Staff {v.staff}
            </div>
            <div className="venue-bar"><div className={`venue-bar-fill ${v.level >= 75 ? 'high' : v.level >= 45 ? 'med' : 'low'}`} style={{ width: `${v.level}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="toggle-row" style={{ marginTop: 16 }}>
        <button className="btn btn-sm" onClick={refresh}>↻ Refresh demand signals</button>
        <button className="btn btn-primary btn-sm" onClick={analyze} disabled={loading}>
          {loading ? 'Calculating…' : 'AI reallocation plan'}
        </button>
      </div>
      {result && (
        <div className="ai-output" role="status" aria-live="polite">
          <span className="tag">{source === 'live' ? 'AI-generated plan' : 'Demo intelligence'}</span>
          {result}
        </div>
      )}
    </div>
  );
}
