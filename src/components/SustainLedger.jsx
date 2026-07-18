import React, { useState } from 'react';
import { useAIAction } from '../hooks/useAIAction.js';
import { VENUES } from '../lib/venues.js';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

const MODES = ['Metro + shuttle', 'Shared ride-pool', 'Regional rail', 'Bike + park-and-stride'];

// Simulated tournament-wide running total across all 16 venues, seeded once.
const TOURNAMENT_TOTAL_KG = 48200;

export default function SustainLedger() {
  const [venue, setVenue] = useState('Miami');
  const [mode, setMode] = useState(MODES[0]);
  const [sessionSaved, setSessionSaved] = useState(0);
  const { loading, result, source, run } = useAIAction();

  async function estimate() {
    const text = await run('sustainledger', `Venue: ${venue}. Transport mode chosen: ${mode}.`);
    const match = text.match(/([\d.]+)\s*kg/);
    if (match) setSessionSaved((v) => +(v + parseFloat(match[1])).toFixed(1));
  }

  return (
    <div>
      <ModuleIntro>
        Individual fan choices roll up into one tournament-wide ledger across all 16 venues in 3 countries.
      </ModuleIntro>
      <div className="grid-2">
        <div>
          <label className="field-label" htmlFor="sl-venue">Venue</label>
          <select id="sl-venue" value={venue} onChange={(e) => setVenue(e.target.value)}>
            {VENUES.map((v) => <option key={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="sl-mode">Transport mode</label>
          <select id="sl-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            {MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={estimate} disabled={loading}>
        {loading ? 'Calculating…' : 'Estimate impact'}
      </button>
      {result && (
        <AIOutputPanel tag={aiTag(source, 'AI-generated estimate')}>
          {result}
        </AIOutputPanel>
      )}
      <div className="stat-row">
        <div className="stat"><b>{sessionSaved} kg</b><span>Saved this session</span></div>
        <div className="stat"><b>{(TOURNAMENT_TOTAL_KG / 1000).toFixed(1)}t</b><span>Tournament-wide (simulated)</span></div>
        <div className="stat"><b>16</b><span>Venues contributing</span></div>
      </div>
    </div>
  );
}
