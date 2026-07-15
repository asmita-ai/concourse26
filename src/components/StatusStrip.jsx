import React from 'react';

const MESSAGES = [
  { c: 'us', tag: 'DALLAS', text: 'Congestion easing on main concourse — 4 min wait' },
  { c: 'mx', tag: 'MEXICO CITY', text: 'Journey Concierge routed 1,900 fans to Monterrey this week' },
  { c: 'ca', tag: 'TORONTO', text: 'Accessibility Passport synced for 32 fans arriving from NY/NJ' },
  { c: 'us', tag: 'ATLANTA→MIAMI', text: 'Cross-venue transit corridor trending toward capacity' },
  { c: 'mx', tag: 'GUADALAJARA', text: '6 stewards reallocated from early kickoff to evening surge' },
  { c: 'us', tag: 'SEATTLE', text: 'Incident correlation: no cross-venue pattern flagged today' },
  { c: 'ca', tag: 'VANCOUVER', text: '3.1 tonnes CO2 saved via green-route suggestions this week' },
];

export default function StatusStrip() {
  const loop = [...MESSAGES, ...MESSAGES];
  return (
    <div className="strip-wrap" role="status" aria-label="Live cross-venue operations updates">
      <div className="strip-label">
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--signal)' }} />
        TOURNAMENT-WIDE FEED
      </div>
      <div className="strip-track">
        {loop.map((m, i) => (
          <span key={i}>
            <em style={{ background: `var(--${m.c})22`, color: `var(--${m.c})` }}>{m.tag}</em>
            {m.text}
          </span>
        ))}
      </div>
    </div>
  );
}
