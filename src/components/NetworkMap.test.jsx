import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkMap from './NetworkMap.jsx';
import StatusStrip from './StatusStrip.jsx';
import { VENUES, LINKS } from '../lib/venues.js';

describe('NetworkMap', () => {
  it('renders one marker per host venue', () => {
    const { container } = render(<NetworkMap />);
    const circles = container.querySelectorAll('circle');
    // Two circles per venue (outer glow + solid dot).
    expect(circles.length).toBe(VENUES.length * 2);
  });

  it('renders a connecting line for every entry in LINKS', () => {
    const { container } = render(<NetworkMap />);
    expect(container.querySelectorAll('line').length).toBe(LINKS.length);
  });

  it('has an accessible label describing the diagram', () => {
    render(<NetworkMap />);
    expect(screen.getByRole('img', { name: /16 fifa world cup 2026 host cities/i })).toBeInTheDocument();
  });
});

describe('StatusStrip', () => {
  it('renders as a live status region', () => {
    render(<StatusStrip />);
    expect(screen.getByRole('status', { name: /live cross-venue operations updates/i })).toBeInTheDocument();
  });
});
