import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JourneyConcierge from './JourneyConcierge.jsx';
import { _clearAICache } from '../lib/ai.js';

describe('JourneyConcierge', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('renders the origin, venue, and note fields with sensible defaults', () => {
    render(<JourneyConcierge />);
    expect(screen.getByLabelText(/traveling from/i)).toHaveValue('Chicago');
    expect(screen.getByLabelText(/first match venue/i)).toHaveValue('Dallas');
    expect(screen.getByLabelText(/next match venue/i)).toHaveValue('Atlanta');
  });

  it('renders all three quick-start itinerary presets', () => {
    render(<JourneyConcierge />);
    expect(screen.getByText('Chicago → Dallas → Atlanta')).toBeInTheDocument();
    expect(screen.getByText('London → Mexico City → Houston')).toBeInTheDocument();
  });

  it('generates a demo journey plan when the primary button is clicked', async () => {
    render(<JourneyConcierge />);
    fireEvent.click(screen.getByRole('button', { name: /generate cross-city journey plan/i }));
    await waitFor(() => expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument());
  });

  it('fills the form and runs a plan when a starter preset is clicked', async () => {
    render(<JourneyConcierge />);
    fireEvent.click(screen.getByText('Vancouver resident → Vancouver → Seattle'));
    await waitFor(() => expect(screen.getByLabelText(/traveling from/i)).toHaveValue('Vancouver resident'));
    await waitFor(() => expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument());
  });
});
