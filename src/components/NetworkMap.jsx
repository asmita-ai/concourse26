import React from 'react';
import { VENUES, LINKS, findVenue } from '../lib/venues.js';

const COLOR = { us: 'var(--us)', mx: 'var(--mx)', ca: 'var(--ca)' };

export default function NetworkMap() {
  return (
    <div className="network-card">
      <svg viewBox="0 0 640 420" role="img" aria-label="Network diagram of all 16 FIFA World Cup 2026 host cities across the USA, Mexico and Canada, connected by fan-travel corridors">
        {LINKS.map(([a, b], i) => {
          const va = findVenue(a);
          const vb = findVenue(b);
          if (!va || !vb) return null;
          const color = va.country === vb.country ? COLOR[va.country] : 'var(--ink-faint)';
          return (
            <line
              key={i}
              x1={va.x} y1={va.y} x2={vb.x} y2={vb.y}
              stroke={color}
              strokeWidth="1.4"
              strokeOpacity="0.55"
              strokeDasharray="5 5"
              style={{ animation: `dash 3.5s linear infinite`, animationDelay: `${(i % 6) * -0.4}s` }}
            />
          );
        })}
        {VENUES.map((v) => (
          <g key={v.id}>
            <circle cx={v.x} cy={v.y} r="9" fill={COLOR[v.country]} fillOpacity="0.18" />
            <circle cx={v.x} cy={v.y} r="4" fill={COLOR[v.country]} />
            <text
              x={v.x} y={v.y - 13}
              textAnchor="middle"
              fontFamily="Space Mono, monospace"
              fontSize="9"
              fill="var(--ink-muted)"
            >
              {v.id}
            </text>
          </g>
        ))}
      </svg>
      <div className="network-caption">
        <span>16 HOST VENUES</span>
        <span>3 COUNTRIES</span>
        <span>1 CONNECTED LAYER</span>
      </div>
    </div>
  );
}
