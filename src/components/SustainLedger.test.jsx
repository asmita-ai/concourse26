import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SustainLedger from './SustainLedger.jsx';

describe('SustainLedger', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('renders the tournament-wide running total', () => {
    render(<SustainLedger />);
    expect(screen.getByText(/tournament-wide \(simulated\)/i)).toBeInTheDocument();
  });

  it('estimates impact and accumulates a session total', async () => {
    render(<SustainLedger />);
    fireEvent.click(screen.getByRole('button', { name: /estimate impact/i }));
    await waitFor(() => {
      expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument();
    });
    // Session-saved stat should have moved off its initial "0 kg" state.
    expect(screen.queryByText('0 kg')).not.toBeInTheDocument();
  });

  it('lets the user change the venue and transport mode', () => {
    render(<SustainLedger />);
    fireEvent.change(screen.getByLabelText(/^venue$/i), { target: { value: 'Toronto' } });
    fireEvent.change(screen.getByLabelText(/transport mode/i), { target: { value: 'Regional rail' } });
    expect(screen.getByLabelText(/^venue$/i)).toHaveValue('Toronto');
    expect(screen.getByLabelText(/transport mode/i)).toHaveValue('Regional rail');
  });
});
