import React, { useState } from 'react';
import { askAI } from '../lib/ai.js';
import { VENUES } from '../lib/venues.js';

const MODES = ['Metro + shuttle', 'Shared ride-pool', 'Regional rail', 'Bike + park-and-stride'];

// Simulated tournament-wide running total across all 16 venues, seeded once.
const TOURNAMENT_TOTAL_KG = 48200;

export default function SustainLedger() {
  const [venue, setVenue] = useState('Miami');
  const [mode, setMode] = useState(MODES[0]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const [sessionSaved, setSessionSaved] = useState(0);

  async function estimate() {
    setLoading(true);
    const { text, source } = await askAI('sustainledger', `Venue: ${venue}. Transport mode chosen: ${mode}.`);
    setResult(text);
    setSource(source);
    const match = text.match(/([\d.]+)\s*kg/);
    if (match) setSessionSaved((v) => +(v + parseFloat(match[1])).toFixed(1));
    setLoading(false);
  }

  return (
    <div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginTop: 0 }}>
        Individual fan choices roll up into one tournament-wide ledger across all 16 venues in 3 countries.
      </p>
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
        <div className="ai-output" role="status" aria-live="polite">
          <span className="tag">{source === 'live' ? 'AI-generated estimate' : 'Demo intelligence'}</span>
          {result}
        </div>
      )}
      <div className="stat-row">
        <div className="stat"><b>{sessionSaved} kg</b><span>Saved this session</span></div>
        <div className="stat"><b>{(TOURNAMENT_TOTAL_KG / 1000).toFixed(1)}t</b><span>Tournament-wide (simulated)</span></div>
        <div className="stat"><b>16</b><span>Venues contributing</span></div>
      </div>
    </div>
  );
}
