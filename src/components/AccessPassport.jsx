import React, { useState } from 'react';
import { useAIAction } from '../hooks/useAIAction.js';
import { VENUES } from '../lib/venues.js';
import ModuleIntro from './ModuleIntro.jsx';
import AIOutputPanel, { aiTag } from './AIOutputPanel.jsx';

const PRESETS = ['Wheelchair access', 'Visually impaired, needs escort', 'Hearing assistance for alerts'];

export default function AccessPassport() {
  const [need, setNeed] = useState('Wheelchair access');
  const [venue, setVenue] = useState('Toronto');
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const { loading, result, source, run } = useAIAction();

  function plan() {
    run('accesspass', `Need: ${need}. Venue: ${venue}.`);
  }

  return (
    <div>
      <ModuleIntro>
        A fan&rsquo;s accessibility profile travels with them — regenerated for whichever of the 16 venues they&rsquo;re headed to next.
      </ModuleIntro>
      <div className="grid-2">
        <div>
          <label className="field-label" htmlFor="ap-need">Accessibility need</label>
          <textarea id="ap-need" value={need} onChange={(e) => setNeed(e.target.value)} />
          <div className="toggle-row" style={{ marginTop: 10 }}>
            {PRESETS.map((p) => <button key={p} className="toggle" onClick={() => setNeed(p)}>{p}</button>)}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="ap-venue">Next venue on this fan&rsquo;s itinerary</label>
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
        <AIOutputPanel
          tag={aiTag(source, 'AI-generated plan')}
          style={{ fontSize: largeText ? 17 : 14, background: highContrast ? '#000' : undefined, color: highContrast ? '#FFF200' : undefined }}
        >
          {result}
        </AIOutputPanel>
      )}
    </div>
  );
}
