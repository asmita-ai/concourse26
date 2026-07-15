import React, { useState } from 'react';
import { askAI } from '../lib/ai.js';
import { VENUES } from '../lib/venues.js';

function makeLevels() {
  // Simulate 8 currently "active matchday" venues out of the 16
  const active = VENUES.slice(0, 8);
  return active.map((v) => ({ ...v, level: Math.floor(20 + Math.random() * 78) }));
}

function tier(level) {
  if (level >= 75) return 'high';
  if (level >= 45) return 'med';
  return 'low';
}

export default function CrowdMesh() {
  const [venues, setVenues] = useState(makeLevels);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);

  function refresh() { setVenues(makeLevels()); setResult(null); }

  async function analyze() {
    setLoading(true);
    const { text, source } = await askAI('crowdmesh', venues.map(({ id, name, country, level }) => ({ id, name, country, level })));
    setResult(text);
    setSource(source);
    setLoading(false);
  }

  const avg = Math.round(venues.reduce((s, v) => s + v.level, 0) / venues.length);
  const highCount = venues.filter((v) => v.level >= 75).length;

  return (
    <div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginTop: 0 }}>
        Live density across multiple host cities at once — not one stadium in isolation. Watch for cascading risk between venues sharing a region or travel corridor.
      </p>
      <div className="venue-grid">
        {venues.map((v) => (
          <div className="venue-tile" key={v.id} title={`${v.name}: ${v.level}%`}>
            <div className="vname"><span>{v.id}</span><span className={`pill ${v.country}`}><i />{v.level}%</span></div>
            <div className="venue-bar"><div className={`venue-bar-fill ${tier(v.level)}`} style={{ width: `${v.level}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="stat-row">
        <div className="stat"><b>{avg}%</b><span>Avg across active venues</span></div>
        <div className="stat"><b>{highCount}</b><span>Venues at high density</span></div>
        <div className="stat"><b>{venues.length}</b><span>Venues live right now</span></div>
      </div>
      <div className="toggle-row" style={{ marginTop: 16 }}>
        <button className="btn btn-sm" onClick={refresh}>↻ Refresh live feed</button>
        <button className="btn btn-primary btn-sm" onClick={analyze} disabled={loading}>
          {loading ? 'Analyzing…' : 'AI cross-venue risk analysis'}
        </button>
      </div>
      {result && (
        <div className="ai-output">
          <span className="tag">{source === 'live' ? 'AI-generated analysis' : 'Demo intelligence'}</span>
          {result}
        </div>
      )}
    </div>
  );
}
