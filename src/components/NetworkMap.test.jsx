import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkMap from './NetworkMap.jsx';
import StatusStrip from './StatusStrip.jsx';
import { VENUES } from '../lib/venues.js';

describe('NetworkMap', () => {
  it('renders an accessible network diagram covering all 16 venues', () => {
    render(<NetworkMap />);
    expect(screen.getByRole('img', { name: /network diagram/i })).toBeInTheDocument();
    expect(screen.getByText('16 HOST VENUES')).toBeInTheDocument();
    expect(screen.getByText('3 COUNTRIES')).toBeInTheDocument();
  });

  it('labels every venue by its id on the diagram', () => {
    render(<NetworkMap />);
    for (const v of VENUES) {
      expect(screen.getByText(v.id)).toBeInTheDocument();
    }
  });
});

describe('StatusStrip', () => {
  it('renders the tournament-wide live feed label', () => {
    render(<StatusStrip />);
    expect(screen.getByText('TOURNAMENT-WIDE FEED')).toBeInTheDocument();
  });

  it('exposes the feed as a status region for screen readers', () => {
    render(<StatusStrip />);
    expect(screen.getByRole('status', { name: /live cross-venue operations updates/i })).toBeInTheDocument();
  });
});
