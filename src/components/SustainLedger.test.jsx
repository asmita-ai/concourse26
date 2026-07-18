import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SustainLedger from './SustainLedger.jsx';
import { _clearAICache } from '../lib/ai.js';

describe('SustainLedger', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    _clearAICache();
  });

  it('renders the tournament-wide simulated total and venue count', () => {
    render(<SustainLedger />);
    expect(screen.getByText(/tournament-wide \(simulated\)/i)).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('estimates CO2 saved for a chosen transport mode', async () => {
    render(<SustainLedger />);
    fireEvent.click(screen.getByRole('button', { name: /estimate impact/i }));
    await waitFor(() => expect(screen.getByText(/kg versus driving alone/i)).toBeInTheDocument());
  });

  it('accumulates the session total after an estimate', async () => {
    render(<SustainLedger />);
    expect(screen.getByText('0 kg')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /estimate impact/i }));
    await waitFor(() => expect(screen.getByText(/kg versus driving alone/i)).toBeInTheDocument());
    expect(screen.queryByText('0 kg')).not.toBeInTheDocument();
  });
});
