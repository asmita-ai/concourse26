import React, { useState } from 'react';
import { useAIAction } from '../hooks/useAIAction.js';
import { VENUES } from '../lib/venues.js';
import { densityTier, DENSITY_THRESHOLDS } from '../lib/density.js';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

function makeLevels() {
  // Simulate 8 currently "active matchday" venues out of the 16
  const active = VENUES.slice(0, 8);
  return active.map((v) => ({ ...v, level: Math.floor(20 + Math.random() * 78) }));
}

export default function CrowdMesh() {
  const [venues, setVenues] = useState(makeLevels);
  const { loading, result, source, run, reset } = useAIAction();

  function refresh() { setVenues(makeLevels()); reset(); }

  function analyze() {
    run('crowdmesh', venues.map(({ id, name, country, level }) => ({ id, name, country, level })));
  }

  const avg = Math.round(venues.reduce((s, v) => s + v.level, 0) / venues.length);
  const highCount = venues.filter((v) => v.level >= DENSITY_THRESHOLDS.high).length;

  return (
    <div>
      <ModuleIntro>
        Live density across multiple host cities at once — not one stadium in isolation. Watch for cascading risk between venues sharing a region or travel corridor.
      </ModuleIntro>
      <div className="venue-grid">
        {venues.map((v) => (
          <div className="venue-tile" key={v.id} title={`${v.name}: ${v.level}%`}>
            <div className="vname"><span>{v.id}</span><span className={`pill ${v.country}`}><i />{v.level}%</span></div>
            <div className="venue-bar"><div className={`venue-bar-fill ${densityTier(v.level)}`} style={{ width: `${v.level}%` }} /></div>
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
        <AIOutputPanel tag={aiTag(source, 'AI-generated analysis')}>
          {result}
        </AIOutputPanel>
      )}
    </div>
  );
}
