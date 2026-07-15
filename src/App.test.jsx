import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
  });

  it('renders the hero heading and all six module tabs', () => {
    render(<App />);
    expect(screen.getByText(/one intelligence layer/i)).toBeInTheDocument();
    expect(screen.getByText(/M1 — Journey Concierge/)).toBeInTheDocument();
    expect(screen.getByText(/M6 — Sustainability Ledger/)).toBeInTheDocument();
  });

  it('switches the active panel when a module tab is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/M2 — Cross-Venue Crowd Mesh/));
    expect(screen.getByRole('heading', { name: 'Cross-Venue Crowd Mesh' })).toBeInTheDocument();
  });

  it('renders the 16-venue network diagram', () => {
    render(<App />);
    expect(screen.getByRole('img', { name: /network diagram/i })).toBeInTheDocument();
  });
});
