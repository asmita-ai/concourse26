import React, { useState } from 'react';
import { askAI } from '../lib/ai.js';
import { VENUES } from '../lib/venues.js';

const PRESETS = ['Wheelchair access', 'Visually impaired, needs escort', 'Hearing assistance for alerts'];

export default function AccessPassport() {
  const [need, setNeed] = useState('Wheelchair access');
  const [venue, setVenue] = useState('Toronto');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  async function plan() {
    setLoading(true);
    const { text, source } = await askAI('accesspass', `Need: ${need}. Venue: ${venue}.`);
    setResult(text);
    setSource(source);
    setLoading(false);
  }

  return (
    <div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginTop: 0 }}>
        A fan&apos;s accessibility profile travels with them — regenerated for whichever of the 16 venues they&apos;re headed to next.
      </p>
      <div className="grid-2">
        <div>
          <label className="field-label" htmlFor="ap-need">Accessibility need</label>
          <textarea id="ap-need" value={need} onChange={(e) => setNeed(e.target.value)} />
          <div className="toggle-row" style={{ marginTop: 10 }}>
            {PRESETS.map((p) => <button key={p} className="toggle" onClick={() => setNeed(p)}>{p}</button>)}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="ap-venue">Next venue on this fan&apos;s itinerary</label>
          <select id="ap-venue" value={venue} onChange={(e) => setVenue(e.target.value)}>
            {VENUES.map((v) => <option key={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={plan} disabled={loading}>
        {loading ? 'Building plan…' : 'Generate venue-specific accommodation plan'}
      </button>

      <div className="toggle-row" style={{ marginTop: 20 }}>
        <button className={`toggle ${highContrast ? 'on' : ''}`} onClick={() => setHighContrast((v) => !v)} aria-pressed={highContrast}>
          High-contrast {highContrast ? 'on' : 'off'}
        </button>
        <button className={`toggle ${largeText ? 'on' : ''}`} onClick={() => setLargeText((v) => !v)} aria-pressed={largeText}>
          Large text {largeText ? 'on' : 'off'}
        </button>
      </div>

      {result && (
        <div className="ai-output" role="status" aria-live="polite" style={{ fontSize: largeText ? 17 : 14, background: highContrast ? '#000' : undefined, color: highContrast ? '#FFF200' : undefined }}>
          <span className="tag">{source === 'live' ? 'AI-generated plan' : 'Demo intelligence'}</span>
          {result}
        </div>
      )}
    </div>
  );
}
