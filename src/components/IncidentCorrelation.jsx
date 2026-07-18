import React, { useState } from 'react';
import { askAI } from '../lib/ai.js';
import { VENUES } from '../lib/venues.js';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

export default function IncidentCorrelation() {
  const [venue, setVenue] = useState('Atlanta');
  const [report, setReport] = useState('');
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // IncidentCorrelation keeps a running log of past triages rather than a
  // single latest result, so it calls askAI directly instead of the
  // useAIAction hook (which is built around "one result at a time").
  async function submit() {
    const text = report.trim();
    if (!text || loading) return;
    setLoading(true);
    const { text: reply, source } = await askAI('incident', `Venue: ${venue}. Report: ${text}`);
    setLog((l) => [{ venue, text, reply, source, time: new Date().toLocaleTimeString() }, ...l]);
    setReport('');
    setLoading(false);
  }

  return (
    <div>
      <ModuleIntro>
        Triages a single report and flags whether the same pattern is worth watching for at <em>other</em> host cities today.
      </ModuleIntro>
      <div className="grid-2">
        <div>
          <label className="field-label" htmlFor="ic-venue">Venue</label>
          <select id="ic-venue" value={venue} onChange={(e) => setVenue(e.target.value)}>
            {VENUES.map((v) => <option key={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="ic-text">Incident report (plain text)</label>
          <input id="ic-text" type="text" value={report} onChange={(e) => setReport(e.target.value)} placeholder="e.g. Fan collapsed near Gate C concourse, conscious…" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={submit} disabled={loading}>
        {loading ? 'Triaging…' : 'Submit + AI triage'}
      </button>

      {log.length > 0 && (
        <div style={{ marginTop: 18 }}>
          {log.map((entry, i) => (
            <AIOutputPanel
              key={i}
              tag={`${entry.venue} · ${entry.time} · ${aiTag(entry.source, 'AI triage')}`}
              style={{ marginBottom: 10 }}
            >
              <div style={{ color: 'var(--ink-muted)', fontSize: 13, marginBottom: 6 }}>&ldquo;{entry.text}&rdquo;</div>
              {entry.reply}
            </AIOutputPanel>
          ))}
        </div>
      )}
    </div>
  );
}
