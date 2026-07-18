import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JourneyConcierge from './JourneyConcierge.jsx';

describe('JourneyConcierge', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('renders with sensible defaults', () => {
    render(<JourneyConcierge />);
    expect(screen.getByLabelText(/traveling from/i)).toHaveValue('Chicago');
  });

  it('generates a plan and shows demo-mode labeling when no API is available', async () => {
    render(<JourneyConcierge />);
    fireEvent.click(screen.getByRole('button', { name: /generate cross-city journey plan/i }));
    await waitFor(() => {
      expect(screen.getByText(/demo intelligence/i)).toBeInTheDocument();
    });
  });

  it('applies a preset itinerary when its button is clicked', async () => {
    render(<JourneyConcierge />);
    fireEvent.click(screen.getByRole('button', { name: /London → Mexico City → Houston/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/traveling from/i)).toHaveValue('London');
    });
  });
});
