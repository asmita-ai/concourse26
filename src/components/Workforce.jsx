import React, { useState } from 'react';
import { useAIAction } from '../hooks/useAIAction.js';
import { VENUES } from '../lib/venues.js';
import { densityTier } from '../lib/density.js';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

function makeDemand() {
  const active = VENUES.slice(4, 10);
  return active.map((v) => ({ ...v, level: Math.floor(15 + Math.random() * 82), staff: 20 + Math.floor(Math.random() * 40) }));
}

export default function Workforce() {
  const [venues, setVenues] = useState(makeDemand);
  const { loading, result, source, run, reset } = useAIAction();

  function refresh() { setVenues(makeDemand()); reset(); }

  function analyze() {
    run('workforce', venues.map(({ id, name, country, level, staff }) => ({ id, name, country, demandPct: level, staffOnSite: staff })));
  }

  return (
    <div>
      <ModuleIntro>
        Reallocates volunteers and stewards <em>between</em> venues and matchdays, not just within one stadium.
      </ModuleIntro>
      <div className="grid-3">
        {venues.map((v) => (
          <div key={v.id} className="venue-tile">
            <div className="vname"><span>{v.name}</span><span className={`pill ${v.country}`}><i />{v.id}</span></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)', marginBottom: 6 }}>
              Demand {v.level}% · Staff {v.staff}
            </div>
            <div className="venue-bar"><div className={`venue-bar-fill ${densityTier(v.level)}`} style={{ width: `${v.level}%` }} /></div>
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
        <AIOutputPanel tag={aiTag(source, 'AI-generated plan')}>
          {result}
        </AIOutputPanel>
      )}
    </div>
  );
}
